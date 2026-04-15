package com.forher.erp_backend.controller;

import com.forher.erp_backend.entity.PurchaseOrder;
import com.forher.erp_backend.service.Interface.IPurchaseOrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/purchase-orders")
@RequiredArgsConstructor
public class PurchaseOrderController {

    private final IPurchaseOrderService poService;

    // NGHIỆP VỤ: Xem danh sách các phiếu nhập kho
    // Mở cho Nhân viên kho, Quản lý và Giám đốc
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'EMPLOYEE')")
    @GetMapping
    public ResponseEntity<?> getAll() {
        return ResponseEntity.ok(poService.getAllPurchaseOrders());
    }

    // NGHIỆP VỤ: Tạo phiếu đặt hàng / phiếu nhập kho mới
    // Mở cho Nhân viên kho và Quản lý
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'EMPLOYEE')")
    @PostMapping
    public ResponseEntity<?> createPO(@RequestBody PurchaseOrder po) {
        return ResponseEntity.status(HttpStatus.CREATED).body(poService.createPurchaseOrder(po));
    }

    // NGHIỆP VỤ CỐT LÕI: Nhận hàng và tự động cộng kho
    // Nhân viên kho là người trực tiếp bấm xác nhận khi hàng về
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'EMPLOYEE')")
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