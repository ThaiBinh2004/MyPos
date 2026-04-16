package com.forher.erp_backend.dto;

import com.forher.erp_backend.entity.Payslip;
import java.math.BigDecimal;
import java.time.LocalDate;

public record PayslipResponse(
        String payslipId,
        String payrollId,
        LocalDate issueDate,
        String salaryDetail,
        BigDecimal netAmount
) {
    public static PayslipResponse from(Payslip s) {
        return new PayslipResponse(
                s.getPayslipId(),
                s.getPayroll() != null ? s.getPayroll().getPayrollId() : null,
                s.getIssueDate(),
                s.getSalaryDetail(),
                s.getNetAmount()
        );
    }
}
