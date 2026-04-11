package com.forher.erp_backend.controller;

import com.forher.erp_backend.entity.PurchaseOrderDetail;
import com.forher.erp_backend.service.Interface.IPurchaseOrderDetailService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/purchase-order-details")
@RequiredArgsConstructor
public class PurchaseOrderDetailController {

    private final IPurchaseOrderDetailService poDetailService;

    @GetMapping("/po/{poId}")
    public ResponseEntity<?> getDetailsByPoId(@PathVariable String poId) {
        return ResponseEntity.ok(poDetailService.getDetailsByPoId(poId));
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody PurchaseOrderDetail detail) {
        return ResponseEntity.status(HttpStatus.CREATED).body(poDetailService.createPurchaseOrderDetail(detail));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateQuantityReceived(@PathVariable String id, @RequestBody PurchaseOrderDetail detail) {
        return ResponseEntity.ok(poDetailService.updatePurchaseOrderDetail(id, detail));
    }
}