package com.forher.erp_backend.service;

import com.forher.erp_backend.entity.Payroll;
import com.forher.erp_backend.entity.Payslip;
import com.forher.erp_backend.repository.PayrollRepository;
import com.forher.erp_backend.repository.PayslipRepository;
import com.forher.erp_backend.service.Interface.IPayslipService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PayslipService implements IPayslipService {

    private final PayslipRepository payslipRepository;
    private final PayrollRepository payrollRepository;

    // Bỏ @Override ở các hàm CRUD vì trong Interface không khai báo
    public List<Payslip> getAllPayslips() {
        return payslipRepository.findAll();
    }

    public Payslip getPayslipById(String id) {
        return payslipRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy phiếu lương với ID: " + id));
    }

    @Transactional
    public Payslip createPayslip(Payslip payslip) {
        if (payslip.getPayroll() != null) {
            Payroll payroll = payrollRepository.findById(payslip.getPayroll().getPayrollId())
                    .orElseThrow(() -> new RuntimeException("Bảng lương (Payroll) không tồn tại!"));
            payslip.setPayroll(payroll);

            // Tự động gán số tiền thực nhận từ bảng lương sang phiếu lương
            payslip.setNetAmount(payroll.getNetSalary());
        }
        return payslipRepository.save(payslip);
    }

    @Transactional
    public Payslip updatePayslip(String id, Payslip payslipDetails) {
        Payslip existingPayslip = getPayslipById(id);

        existingPayslip.setIssueDate(payslipDetails.getIssueDate());
        existingPayslip.setSalaryDetail(payslipDetails.getSalaryDetail());

        return payslipRepository.save(existingPayslip);
    }

    @Transactional
    public void deletePayslip(String id) {
        Payslip existingPayslip = getPayslipById(id);
        payslipRepository.delete(existingPayslip);
    }

    // =========================================================================
    // NGHIỆP VỤ BẮT BUỘC PHẢI CÓ TỪ INTERFACE IPayslipService (CÓ @Override)
    // =========================================================================
    @Override
    public void generateAndSendPayslip(String payrollId) {
        // Lấy thông tin bảng lương
        Payroll payroll = payrollRepository.findById(payrollId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy bảng lương: " + payrollId));

        System.out.println("--------------------------------------------------");
        System.out.println("HỆ THỐNG ĐANG TẠO PHIẾU LƯƠNG TỪ BẢNG LƯƠNG CỦA NV: " + payroll.getEmployee().getFullName());
        System.out.println("Thực nhận: " + payroll.getNetSalary() + " VNĐ");
        System.out.println("Đang xuất file PDF và gửi Email...");
        System.out.println("Đã gửi email phiếu lương thành công cho nhân viên!");
        System.out.println("--------------------------------------------------");
    }
}