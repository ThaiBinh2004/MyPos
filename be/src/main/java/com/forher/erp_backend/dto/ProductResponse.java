package com.forher.erp_backend.dto;

import com.forher.erp_backend.entity.Product;
import java.math.BigDecimal;

public record ProductResponse(
        String productId,
        String sku,
        String productName,
        BigDecimal price,
        String sizeInfo,
        String color,
        String imageUrl,
        String categoryId,
        String categoryName,
        String status
) {
    public static ProductResponse from(Product p) {
        return new ProductResponse(
                p.getProductId(),
                p.getSku(),
                p.getProductName(),
                p.getPrice(),
                p.getSizeInfo(),
                p.getColor(),
                p.getImageUrl(),
                p.getCategory() != null ? p.getCategory().getCategoryId() : null,
                p.getCategory() != null ? p.getCategory().getCategoryName() : null,
                p.getStatus()
        );
    }
}
