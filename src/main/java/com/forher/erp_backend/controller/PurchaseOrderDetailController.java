package com.forher.erp_backend.controller;

import com.forher.erp_backend.entity.PurchaseOrderDetail;
import com.forher.erp_backend.service.Interface.IPurchaseOrderDetailService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/purchase-order-details")
@RequiredArgsConstructor
public class PurchaseOrderDetailController {

    private final IPurchaseOrderDetailService poDetailService;

    // NGHIỆP VỤ: Lấy danh sách chi tiết các món hàng trong phiếu nhập
    // Mở cho Nhân viên kho, Quản lý và Giám đốc để đối chiếu
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'EMPLOYEE')")
    @GetMapping("/po/{poId}")
    public ResponseEntity<?> getDetailsByPoId(@PathVariable String poId) {
        return ResponseEntity.ok(poDetailService.getDetailsByPoId(poId));
    }

    // NGHIỆP VỤ: Thêm chi tiết món hàng vào phiếu nhập
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'EMPLOYEE')")
    @PostMapping
    public ResponseEntity<?> create(@RequestBody PurchaseOrderDetail detail) {
        return ResponseEntity.status(HttpStatus.CREATED).body(poDetailService.createPurchaseOrderDetail(detail));
    }

    // NGHIỆP VỤ: Cập nhật số lượng thực nhận khi kiểm đếm
    // Nhân viên kho trực tiếp thao tác ghi nhận số lượng thực tế
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'EMPLOYEE')")
    @PutMapping("/{id}")
    public ResponseEntity<?> updateQuantityReceived(@PathVariable String id, @RequestBody PurchaseOrderDetail detail) {
        return ResponseEntity.ok(poDetailService.updatePurchaseOrderDetail(id, detail));
    }
}