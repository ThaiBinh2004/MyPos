package com.forher.erp_backend.dto;

import com.forher.erp_backend.entity.Offboarding;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data @Builder
public class OffboardingResponse {
    private String offboardingId;
    private String employeeId;
    private String employeeName;
    private String employeeBranchId;
    private String employeeBranchName;
    private String employeePosition;
    private String initiatedById;
    private String initiatedByName;
    private String reason;
    private LocalDate lastWorkingDate;
    private String status;
    private String directorNote;
    private String approvedById;
    private String approvedByName;
    private LocalDateTime approvedDate;
    private Boolean employeeConfirmed;
    private LocalDateTime employeeConfirmedAt;
    private String settlementMethod;
    private String settlementNote;
    private LocalDateTime settledAt;
    private String settledByName;
    private LocalDateTime createdAt;
    private List<OffboardingAssetReturnResponse> assetReturns;

    public static OffboardingResponse from(Offboarding o, List<OffboardingAssetReturnResponse> returns) {
        return OffboardingResponse.builder()
                .offboardingId(o.getOffboardingId())
                .employeeId(o.getEmployee().getEmployeeId())
                .employeeName(o.getEmployee().getFullName())
                .employeeBranchId(o.getEmployee().getBranch().getBranchId())
                .employeeBranchName(o.getEmployee().getBranch().getBranchName())
                .employeePosition(o.getEmployee().getPosition())
                .initiatedById(o.getInitiatedBy().getEmployeeId())
                .initiatedByName(o.getInitiatedBy().getFullName())
                .reason(o.getReason())
                .lastWorkingDate(o.getLastWorkingDate())
                .status(o.getStatus())
                .directorNote(o.getDirectorNote())
                .approvedById(o.getApprovedBy() != null ? o.getApprovedBy().getEmployeeId() : null)
                .approvedByName(o.getApprovedBy() != null ? o.getApprovedBy().getFullName() : null)
                .approvedDate(o.getApprovedDate())
                .employeeConfirmed(o.getEmployeeConfirmed())
                .employeeConfirmedAt(o.getEmployeeConfirmedAt())
                .settlementMethod(o.getSettlementMethod())
                .settlementNote(o.getSettlementNote())
                .settledAt(o.getSettledAt())
                .settledByName(o.getSettledBy() != null ? o.getSettledBy().getFullName() : null)
                .createdAt(o.getCreatedAt())
                .assetReturns(returns)
                .build();
    }
}
