package com.forher.erp_backend.dto;

import com.forher.erp_backend.entity.OffboardingAssetReturn;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data @Builder
public class OffboardingAssetReturnResponse {
    private String returnId;
    private String assetId;
    private String assetName;
    private String assetType;
    private BigDecimal assetValue;
    private String returnStatus;
    private LocalDate returnDate;
    private String notes;
    private BigDecimal compensationAmount;

    public static OffboardingAssetReturnResponse from(OffboardingAssetReturn r) {
        return OffboardingAssetReturnResponse.builder()
                .returnId(r.getReturnId())
                .assetId(r.getAsset().getAssetId())
                .assetName(r.getAsset().getAssetName())
                .assetType(r.getAsset().getAssetType())
                .assetValue(r.getAsset().getAssetValue())
                .returnStatus(r.getReturnStatus())
                .returnDate(r.getReturnDate())
                .notes(r.getNotes())
                .compensationAmount(r.getCompensationAmount())
                .build();
    }
}
