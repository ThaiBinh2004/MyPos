package com.forher.erp_backend.dto;

import com.forher.erp_backend.entity.PurchaseOrderDetail;

public record PurchaseOrderDetailResponse(
        String detailId,
        String poId,
        String productId,
        String productName,
        Integer quantityOrdered,
        Integer quantityReceived,
        String note
) {
    public static PurchaseOrderDetailResponse from(PurchaseOrderDetail d) {
        return new PurchaseOrderDetailResponse(
                d.getDetailId(),
                d.getPurchaseOrder() != null ? d.getPurchaseOrder().getPoId() : null,
                d.getProduct() != null ? d.getProduct().getProductId() : null,
                d.getProduct() != null ? d.getProduct().getProductName() : null,
                d.getQuantityOrdered(),
                d.getQuantityReceived(),
                d.getNote()
        );
    }
}
