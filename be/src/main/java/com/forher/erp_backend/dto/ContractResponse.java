package com.forher.erp_backend.dto;

import com.forher.erp_backend.entity.Contract;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public record ContractResponse(
        String contractId,
        String employeeId,
        String employeeName,
        String branchId,
        String branchName,
        String contractType,
        LocalDate startDate,
        LocalDate endDate,
        BigDecimal baseSalary,
        BigDecimal allowance,
        String position,
        String workingHours,
        String leavePolicy,
        String otherTerms,
        String status,
        String approvedById,
        String approvedByName,
        LocalDateTime approvedDate,
        String reviewerNote,
        Boolean signedByEmployee,
        LocalDateTime signedDate,
        LocalDateTime createdAt
) {
    public static ContractResponse from(Contract c) {
        return new ContractResponse(
                c.getContractId(),
                c.getEmployee() != null ? c.getEmployee().getEmployeeId() : null,
                c.getEmployee() != null ? c.getEmployee().getFullName() : null,
                c.getEmployee() != null && c.getEmployee().getBranch() != null ? c.getEmployee().getBranch().getBranchId() : null,
                c.getEmployee() != null && c.getEmployee().getBranch() != null ? c.getEmployee().getBranch().getBranchName() : null,
                c.getContractType(),
                c.getStartDate(),
                c.getEndDate(),
                c.getBaseSalary(),
                c.getAllowance(),
                c.getPosition(),
                c.getWorkingHours(),
                c.getLeavePolicy(),
                c.getOtherTerms(),
                c.getStatus(),
                c.getApprovedBy() != null ? c.getApprovedBy().getEmployeeId() : null,
                c.getApprovedBy() != null ? c.getApprovedBy().getFullName() : null,
                c.getApprovedDate(),
                c.getReviewerNote(),
                c.getSignedByEmployee(),
                c.getSignedDate(),
                c.getCreatedAt()
        );
    }
}
