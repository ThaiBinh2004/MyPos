package com.forher.erp_backend.dto;

import com.forher.erp_backend.entity.Asset;
import java.math.BigDecimal;
import java.time.LocalDate;

public record AssetResponse(
        String assetId,
        String assetName,
        String assetType,
        String employeeId,
        String employeeName,
        LocalDate handoverDate,
        String assetCondition,
        BigDecimal assetValue
) {
    public static AssetResponse from(Asset a) {
        return new AssetResponse(
                a.getAssetId(),
                a.getAssetName(),
                a.getAssetType(),
                a.getEmployee() != null ? a.getEmployee().getEmployeeId() : null,
                a.getEmployee() != null ? a.getEmployee().getFullName() : null,
                a.getHandoverDate(),
                a.getAssetCondition(),
                a.getAssetValue()
        );
    }
}
