package com.forher.erp_backend.service.Interface;
import com.forher.erp_backend.entity.Payroll;
import java.util.List;

public interface IPayrollService {
    List<Payroll> getAllPayrolls();
    Payroll getPayrollById(String id);
    Payroll calculateMonthlyPayroll(String employeeId, int month, int year);
    Payroll approvePayroll(String payrollId, String managerId);
    void markAsPaid(String payrollId);
}
