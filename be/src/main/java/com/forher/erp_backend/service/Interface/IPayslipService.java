package com.forher.erp_backend.service.Interface;
import com.forher.erp_backend.entity.Payslip;

public interface IPayslipService {
    Payslip getPayslipByPayrollId(String payrollId);
    void generateAndSendPayslip(String payrollId);
}
