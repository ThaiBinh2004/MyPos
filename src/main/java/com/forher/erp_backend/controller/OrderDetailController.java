package com.forher.erp_backend.controller;

import com.forher.erp_backend.entity.OrderDetail;
import com.forher.erp_backend.service.Interface.IOrderDetailService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/order-details")
@RequiredArgsConstructor
public class OrderDetailController {

    private final IOrderDetailService orderDetailService;

    // NGHIỆP VỤ: Xem danh sách các món hàng trong 1 đơn hàng cụ thể
    // Mọi người (từ Nhân viên đến Giám đốc) đều được xem để đối chiếu
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'EMPLOYEE')")
    @GetMapping("/order/{orderId}")
    public ResponseEntity<?> getDetailsByOrderId(@PathVariable String orderId) {
        return ResponseEntity.ok(orderDetailService.getDetailsByOrderId(orderId));
    }

    // NGHIỆP VỤ: Thêm 1 món hàng vào đơn hàng (Quét mã vạch/Thêm vào giỏ)
    // Nhân viên bán hàng trực tiếp thao tác
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'EMPLOYEE')")
    @PostMapping
    public ResponseEntity<?> create(@RequestBody OrderDetail detail) {
        try {
            return ResponseEntity.status(HttpStatus.CREATED).body(orderDetailService.createOrderDetail(detail));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Lỗi thêm chi tiết: " + e.getMessage());
        }
    }
}