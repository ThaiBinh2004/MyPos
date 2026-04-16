package com.forher.erp_backend.dto;

import com.forher.erp_backend.entity.PurchaseOrder;
import java.time.LocalDate;

public record PurchaseOrderResponse(
        String poId,
        String supplierId,
        String supplierName,
        String branchId,
        LocalDate date,
        String status,
        String note
) {
    public static PurchaseOrderResponse from(PurchaseOrder p) {
        return new PurchaseOrderResponse(
                p.getPoId(),
                p.getSupplier() != null ? p.getSupplier().getSupplierId() : null,
                p.getSupplier() != null ? p.getSupplier().getSupplierName() : null,
                p.getBranch() != null ? p.getBranch().getBranchId() : null,
                p.getOrderDate(),
                p.getStatus(),
                p.getNote()
        );
    }
}
