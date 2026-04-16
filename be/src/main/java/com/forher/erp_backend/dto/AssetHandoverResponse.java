package com.forher.erp_backend.dto;

import com.forher.erp_backend.entity.AssetHandover;
import java.time.LocalDate;

public record AssetHandoverResponse(
        String handoverId,
        String employeeId,
        String employeeName,
        LocalDate issueDate,
        String assetList,
        String assetCondition,
        String approvedBy
) {
    public static AssetHandoverResponse from(AssetHandover h) {
        return new AssetHandoverResponse(
                h.getHandoverId(),
                h.getEmployee() != null ? h.getEmployee().getEmployeeId() : null,
                h.getEmployee() != null ? h.getEmployee().getFullName() : null,
                h.getIssueDate(),
                h.getAssetList(),
                h.getAssetCondition(),
                h.getApprovedBy() != null ? h.getApprovedBy().getFullName() : null
        );
    }
}
