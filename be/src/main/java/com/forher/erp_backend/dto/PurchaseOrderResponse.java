package com.forher.erp_backend.dto;

import com.forher.erp_backend.entity.PurchaseOrder;
import java.time.LocalDate;

public record PurchaseOrderResponse(
        String poId,
        String supplierId,
        String supplierName,
        String branchId,
        String branchName,
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
                p.getBranch() != null ? p.getBranch().getBranchName() : null,
                p.getOrderDate(),
                p.getStatus(),
                p.getNote()
        );
    }
}
