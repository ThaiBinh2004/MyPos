package com.forher.erp_backend.service.Interface;
import com.forher.erp_backend.entity.Payroll;

public interface IPayslipService {
    // Nghiệp vụ: Sinh phiếu lương từ Bảng lương và gửi qua Email
    void generateAndSendPayslip(String payrollId);
}