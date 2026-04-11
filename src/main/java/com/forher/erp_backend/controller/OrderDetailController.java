package com.forher.erp_backend.controller;

import com.forher.erp_backend.entity.OrderDetail;
import com.forher.erp_backend.service.Interface.IOrderDetailService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/order-details")
@RequiredArgsConstructor
public class OrderDetailController {

    private final IOrderDetailService orderDetailService;

    @GetMapping("/order/{orderId}")
    public ResponseEntity<?> getDetailsByOrderId(@PathVariable String orderId) {
        return ResponseEntity.ok(orderDetailService.getDetailsByOrderId(orderId));
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody OrderDetail detail) {
        try {
            return ResponseEntity.status(HttpStatus.CREATED).body(orderDetailService.createOrderDetail(detail));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Lỗi thêm chi tiết: " + e.getMessage());
        }
    }
}