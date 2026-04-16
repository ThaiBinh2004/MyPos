package com.forher.erp_backend.dto;

import com.forher.erp_backend.entity.Inventory;
import java.time.LocalDateTime;

public record InventoryResponse(
        String inventoryId,
        String productId,
        String productName,
        String branchId,
        Integer quantity,
        Integer minThreshold,
        LocalDateTime updatedAt
) {
    public static InventoryResponse from(Inventory i) {
        return new InventoryResponse(
                i.getInventoryId(),
                i.getProduct() != null ? i.getProduct().getProductId() : null,
                i.getProduct() != null ? i.getProduct().getProductName() : null,
                i.getBranch() != null ? i.getBranch().getBranchId() : null,
                i.getQuantity(),
                i.getMinThreshold(),
                i.getUpdatedAt()
        );
    }
}
