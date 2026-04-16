package com.forher.erp_backend.dto;

import com.forher.erp_backend.entity.Contract;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public record ContractResponse(
        String contractId,
        String employeeId,
        String employeeName,
        String contractType,
        LocalDate startDate,
        LocalDate endDate,
        BigDecimal baseSalary,
        BigDecimal allowance,
        String status,
        String approvedBy,
        LocalDateTime approvedDate
) {
    public static ContractResponse from(Contract c) {
        return new ContractResponse(
                c.getContractId(),
                c.getEmployee() != null ? c.getEmployee().getEmployeeId() : null,
                c.getEmployee() != null ? c.getEmployee().getFullName() : null,
                c.getContractType(),
                c.getStartDate(),
                c.getEndDate(),
                c.getBaseSalary(),
                c.getAllowance(),
                c.getStatus(),
                c.getApprovedBy() != null ? c.getApprovedBy().getFullName() : null,
                c.getApprovedDate()
        );
    }
}
