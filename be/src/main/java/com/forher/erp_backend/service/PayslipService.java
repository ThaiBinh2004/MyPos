package com.forher.erp_backend.service;

import com.forher.erp_backend.entity.Payslip;
import com.forher.erp_backend.repository.PayrollRepository;
import com.forher.erp_backend.repository.PayslipRepository;
import com.forher.erp_backend.service.Interface.IPayslipService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

@Service
@RequiredArgsConstructor
public class PayslipService implements IPayslipService {

    private final PayslipRepository payslipRepository;
    private final PayrollRepository payrollRepository;

    @Override
    public Payslip getPayslipByPayrollId(String payrollId) {
        return payslipRepository.findAll().stream()
                .filter(p -> p.getPayroll().getPayrollId().equals(payrollId))
                .findFirst().orElseThrow(() -> new RuntimeException("Không tìm thấy phiếu lương!"));
    }

    @Override @Transactional
    public void generateAndSendPayslip(String payrollId) {
        var payroll = payrollRepository.findById(payrollId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy bảng lương!"));
        boolean exists = payslipRepository.findAll().stream()
                .anyMatch(p -> p.getPayroll().getPayrollId().equals(payrollId));
        if (!exists) {
            Payslip payslip = Payslip.builder()
                    .payslipId("PS-" + payrollId)
                    .payroll(payroll)
                    .issueDate(LocalDate.now())
                    .netAmount(payroll.getNetSalary())
                    .salaryDetail("{\"month\":" + payroll.getMonthNum() + ",\"year\":" + payroll.getYearNum() + "}")
                    .build();
            payslipRepository.save(payslip);
        }
    }
}
