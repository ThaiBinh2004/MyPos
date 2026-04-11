package com.forher.erp_backend.controller;

import com.forher.erp_backend.entity.PurchaseOrder;
import com.forher.erp_backend.service.Interface.IPurchaseOrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/purchase-orders")
@RequiredArgsConstructor
public class PurchaseOrderController {

    private final IPurchaseOrderService poService;

    @GetMapping
    public ResponseEntity<?> getAll() { return ResponseEntity.ok(poService.getAllPurchaseOrders()); }

    @PostMapping
    public ResponseEntity<?> createPO(@RequestBody PurchaseOrder po) {
        return ResponseEntity.status(HttpStatus.CREATED).body(poService.createPurchaseOrder(po));
    }

    // NGHIỆP VỤ CỐT LÕI: Nhận hàng và tự động cộng kho
    @PatchMapping("/{id}/receive")
    public ResponseEntity<?> receiveGoods(@PathVariable String id) {
        try {
            poService.receiveGoods(id);
            return ResponseEntity.ok("Xác nhận nhập kho thành công! Đã tự động cộng dồn số lượng vào Tồn kho.");
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Lỗi Server: " + e.getMessage());
        }
    }
}