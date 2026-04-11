package com.forher.erp_backend.service.Interface;
import com.forher.erp_backend.entity.Payroll;

public interface IPayrollService {
    // Nghiệp vụ cốt lõi: Tự động tính lương cuối tháng cho 1 NV
    Payroll calculateMonthlyPayroll(String employeeId, int month, int year);

    // Nghiệp vụ: Giám đốc duyệt bảng lương
    Payroll approvePayroll(String payrollId, String managerId);
}