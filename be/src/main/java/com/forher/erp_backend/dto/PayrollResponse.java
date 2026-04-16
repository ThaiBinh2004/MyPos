package com.forher.erp_backend.dto;

import com.forher.erp_backend.entity.Payroll;
import java.math.BigDecimal;

public record PayrollResponse(
        String payrollId,
        String employeeId,
        String employeeName,
        String branchId,
        Integer monthNum,
        Integer yearNum,
        BigDecimal baseSalary,
        BigDecimal allowance,
        BigDecimal salesPay,
        BigDecimal salesBonus,
        BigDecimal absBonus,
        BigDecimal deduction,
        BigDecimal netSalary,
        String status,
        String approveBy
) {
    public static PayrollResponse from(Payroll p) {
        return new PayrollResponse(
                p.getPayrollId(),
                p.getEmployee() != null ? p.getEmployee().getEmployeeId() : null,
                p.getEmployee() != null ? p.getEmployee().getFullName() : null,
                p.getEmployee() != null && p.getEmployee().getBranch() != null
                        ? p.getEmployee().getBranch().getBranchId() : null,
                p.getMonthNum(),
                p.getYearNum(),
                p.getBaseSalary(),
                p.getAllowance(),
                p.getOvertimePay(),
                p.getSalesBonus(),
                p.getAbcBonus(),
                p.getDeduction(),
                p.getNetSalary(),
                p.getStatus(),
                p.getApprovedBy() != null ? p.getApprovedBy().getFullName() : null
        );
    }
}
