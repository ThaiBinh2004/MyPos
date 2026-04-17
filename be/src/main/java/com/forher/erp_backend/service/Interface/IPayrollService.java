package com.forher.erp_backend.service.Interface;

import com.forher.erp_backend.entity.Payroll;
import com.forher.erp_backend.entity.PayrollDeduction;
import com.forher.erp_backend.entity.SalesRecord;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.util.List;

public interface IPayrollService {
    // Tạo / tính lại bảng lương
    Payroll generatePayroll(String employeeId, String month, String createdById);
    List<Payroll> generateBulk(String month, String branchId, String createdById);

    // Cập nhật thủ công (OT, nghỉ phép, ABC, hệ số phụ cấp)
    Payroll updateManual(String payrollId, Integer leaveDays, BigDecimal otHours,
                         BigDecimal otHolidayHours, BigDecimal allowanceRate,
                         String abcRating, String note);

    // Chốt bảng lương
    Payroll finalizePayroll(String payrollId);

    // Import Excel doanh số
    int importSales(MultipartFile file, String month, String importedBy);

    // Khấu trừ
    PayrollDeduction addDeduction(String employeeId, String type, BigDecimal amount,
                                  String reason, String month, String approvedById);

    // Queries
    List<Payroll> getPayrolls(String month, String branchId);
    List<Payroll> getPayrollsByEmployee(String employeeId);
    Payroll getPayrollById(String id);
    List<SalesRecord> getSalesRecords(String month, String branchId);
    List<PayrollDeduction> getDeductions(String month, String branchId);
}
