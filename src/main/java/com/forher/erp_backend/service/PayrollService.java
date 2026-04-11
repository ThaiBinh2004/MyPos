package com.forher.erp_backend.service;

import com.forher.erp_backend.entity.Contract;
import com.forher.erp_backend.entity.Employee;
import com.forher.erp_backend.entity.Payroll;
import com.forher.erp_backend.repository.ContractRepository;
import com.forher.erp_backend.repository.EmployeeRepository;
import com.forher.erp_backend.repository.PayrollRepository;
import com.forher.erp_backend.service.Interface.IPayrollService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
public class PayrollService implements IPayrollService {

    private final PayrollRepository payrollRepository;
    private final EmployeeRepository employeeRepository;
    private final ContractRepository contractRepository;

    @Override
    @Transactional
    public Payroll calculateMonthlyPayroll(String employeeId, int month, int year) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new RuntimeException("Nhân viên không tồn tại"));

        // Lấy hợp đồng đang Active của nhân viên để lấy Lương cơ bản và Phụ cấp
        Contract activeContract = contractRepository.findAll().stream()
                .filter(c -> c.getEmployee().getEmployeeId().equals(employeeId) && "ACTIVE".equals(c.getStatus()))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Nhân viên chưa có hợp đồng hiệu lực!"));

        Payroll payroll = Payroll.builder()
                .payrollId("PR-" + employeeId + "-" + month + year)
                .employee(employee)
                .monthNum(month)
                .yearNum(year)
                .baseSalary(activeContract.getBaseSalary())
                .allowance(activeContract.getAllowance())
                .overtimePay(BigDecimal.ZERO) // Sẽ được Update sau nếu có OT
                .salesBonus(BigDecimal.ZERO)  // Lấy từ SalesReport ở nghiệp vụ nâng cao
                .abcBonus(BigDecimal.ZERO)
                .deduction(BigDecimal.ZERO)
                .status("PENDING") // Chờ Giám đốc duyệt
                .build();

        // Công thức thực nhận: (Lương CB + Phụ cấp + OT + Thưởng) - Khấu trừ
        BigDecimal totalIncome = payroll.getBaseSalary()
                .add(payroll.getAllowance())
                .add(payroll.getOvertimePay())
                .add(payroll.getSalesBonus())
                .add(payroll.getAbcBonus());

        payroll.setNetSalary(totalIncome.subtract(payroll.getDeduction()));

        return payrollRepository.save(payroll);
    }

    @Override
    @Transactional
    public Payroll approvePayroll(String payrollId, String managerId) {
        Payroll payroll = payrollRepository.findById(payrollId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy bảng lương"));

        Employee manager = employeeRepository.findById(managerId).orElse(null);
        payroll.setStatus("APPROVED");
        payroll.setApprovedBy(manager);

        return payrollRepository.save(payroll);
    }
}