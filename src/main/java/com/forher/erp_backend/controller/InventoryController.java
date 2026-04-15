package com.forher.erp_backend.controller;

import com.forher.erp_backend.service.Interface.IInventoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/inventory")
@RequiredArgsConstructor
public class InventoryController {

    private final IInventoryService inventoryService;

    // 1. Lấy danh sách sản phẩm sắp hết hàng tại 1 chi nhánh
    // Mọi người đều cần xem để nắm tình hình tồn kho
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'EMPLOYEE')")
    @GetMapping("/alerts/{branchId}")
    public ResponseEntity<?> getLowStockAlerts(@PathVariable String branchId) {
        try {
            return ResponseEntity.ok(inventoryService.getLowStockAlerts(branchId));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }

    // 2. Kiểm tra xem kho có đủ hàng để bán không
    // Nhân viên phải dùng API này liên tục khi quét mã vạch lên đơn
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'EMPLOYEE')")
    @GetMapping("/check")
    public ResponseEntity<?> checkAvailability(
            @RequestParam String productId,
            @RequestParam String branchId,
            @RequestParam int requiredQuantity) {

        boolean isAvailable = inventoryService.checkAvailability(productId, branchId, requiredQuantity);
        if (isAvailable) {
            return ResponseEntity.ok("Kho ĐỦ hàng để xuất.");
        } else {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Kho KHÔNG ĐỦ hàng!");
        }
    }
}