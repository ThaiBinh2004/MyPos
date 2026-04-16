package com.forher.erp_backend.controller;

import com.forher.erp_backend.dto.PurchaseOrderResponse;
import com.forher.erp_backend.entity.PurchaseOrder;
import com.forher.erp_backend.service.Interface.IPurchaseOrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/sales/purchase-orders")
@RequiredArgsConstructor
public class PurchaseOrderController {

    private final IPurchaseOrderService purchaseOrderService;

    @GetMapping
    public ResponseEntity<?> getAll() {
        return ResponseEntity.ok(purchaseOrderService.getAllPurchaseOrders().stream()
                .map(PurchaseOrderResponse::from).toList());
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody PurchaseOrder purchaseOrder) {
        return ResponseEntity.status(HttpStatus.CREATED).body(
                PurchaseOrderResponse.from(purchaseOrderService.createPurchaseOrder(purchaseOrder))
        );
    }
}
