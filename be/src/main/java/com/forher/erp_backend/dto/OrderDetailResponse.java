package com.forher.erp_backend.dto;

import com.forher.erp_backend.entity.OrderDetail;
import java.math.BigDecimal;

public record OrderDetailResponse(
        String detailId,
        String orderId,
        String productId,
        String productName,
        Integer quantity,
        BigDecimal unitPrice,
        BigDecimal subtotal
) {
    public static OrderDetailResponse from(OrderDetail d) {
        return new OrderDetailResponse(
                d.getDetailId(),
                d.getOrder() != null ? d.getOrder().getOrderId() : null,
                d.getProduct() != null ? d.getProduct().getProductId() : null,
                d.getProduct() != null ? d.getProduct().getProductName() : null,
                d.getQuantity(),
                d.getUnitPrice(),
                d.getSubtotal()
        );
    }
}
