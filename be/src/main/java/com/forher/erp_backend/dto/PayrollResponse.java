package com.forher.erp_backend.dto;

import com.forher.erp_backend.entity.Payroll;
import java.math.BigDecimal;
import java.time.LocalDateTime;

public record PayrollResponse(
        String payrollId,
        String employeeId,
        String employeeName,
        String position,
        String branchId,
        String branchName,
        String month,

        // Ngày công
        Integer workDays,
        Integer leaveDays,

        // OT
        BigDecimal otHours,
        BigDecimal otHolidayHours,

        // Lương cơ bản
        BigDecimal baseSalary,      // mức lương HĐ
        BigDecimal basePay,         // thực nhận theo ngày công

        // Phụ cấp
        BigDecimal allowance,       // mức phụ cấp HĐ
        BigDecimal allowanceRate,
        BigDecimal allowancePay,

        // OT pay
        BigDecimal overtimePay,

        // Thưởng doanh số
        BigDecimal hotBonus,
        BigDecimal livestreamBonus,
        BigDecimal salesBonus,

        // Thưởng ABC
        String     abcRating,
        BigDecimal abcBonus,

        // Tổng và khấu trừ
        BigDecimal totalGross,
        BigDecimal bhxhEmployee,
        BigDecimal tncn,
        BigDecimal advance,
        BigDecimal penalty,
        BigDecimal deduction,       // tổng khấu trừ

        // Lương thực nhận
        BigDecimal netSalary,

        // Metadata
        String     status,
        String     note,
        String     approvedBy,
        LocalDateTime createdAt,
        LocalDateTime finalizedAt
) {
    public static PayrollResponse from(Payroll p) {
        var emp = p.getEmployee();
        return new PayrollResponse(
                p.getPayrollId(),
                emp != null ? emp.getEmployeeId() : null,
                emp != null ? emp.getFullName()    : null,
                emp != null ? emp.getPosition()    : null,
                emp != null && emp.getBranch() != null ? emp.getBranch().getBranchId()   : null,
                emp != null && emp.getBranch() != null ? emp.getBranch().getBranchName() : null,
                p.getMonth(),
                p.getWorkDays(),
                p.getLeaveDays(),
                p.getOtHours(),
                p.getOtHolidayHours(),
                p.getBaseSalary(),
                p.getBasePay(),
                p.getAllowance(),
                p.getAllowanceRate(),
                p.getAllowancePay(),
                p.getOvertimePay(),
                p.getHotBonus(),
                p.getLivestreamBonus(),
                p.getSalesBonus(),
                p.getAbcRating(),
                p.getAbcBonus(),
                p.getTotalGross(),
                p.getBhxhEmployee(),
                p.getTncn(),
                p.getAdvance(),
                p.getPenalty(),
                p.getDeduction(),
                p.getNetSalary(),
                p.getStatus(),
                p.getNote(),
                p.getApprovedBy() != null ? p.getApprovedBy().getFullName() : null,
                p.getCreatedAt(),
                p.getFinalizedAt()
        );
    }
}
