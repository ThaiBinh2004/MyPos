package com.forher.erp_backend.controller;

import com.forher.erp_backend.entity.Orders;
import com.forher.erp_backend.service.Interface.IOrdersService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/orders")
@RequiredArgsConstructor
public class OrdersController {

    private final IOrdersService ordersService;

    @GetMapping
    public ResponseEntity<?> getAllOrders() {
        return ResponseEntity.ok(ordersService.getAllOrders());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getOrderById(@PathVariable String id) {
        try {
            return ResponseEntity.ok(ordersService.getOrderById(id));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    // 1. Tạo đơn Online (Khách tự đặt)
    @PostMapping("/online")
    public ResponseEntity<?> createOnlineOrder(@RequestBody Orders order) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ordersService.createOnlineOrder(order));
    }

    // 2. Tạo đơn Offline (Bán tại quầy POS)
    @PostMapping("/offline")
    public ResponseEntity<?> createOfflineOrder(@RequestBody Orders order) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ordersService.createOfflineOrder(order));
    }

    // 3. Áp dụng mã giảm giá
    @PatchMapping("/{id}/discount")
    public ResponseEntity<?> applyDiscount(@PathVariable String id, @RequestParam double discountAmount) {
        try {
            ordersService.applyDiscount(id, discountAmount);
            return ResponseEntity.ok("Đã áp dụng giảm giá thành công!");
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    // 4. Thanh toán đơn hàng
    @PatchMapping("/{id}/payment")
    public ResponseEntity<?> processPayment(@PathVariable String id, @RequestParam String paymentMethod) {
        try {
            String result = ordersService.processPayment(id, paymentMethod);
            return ResponseEntity.ok(result);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    // 5. Hủy đơn hàng
    @PatchMapping("/{id}/cancel")
    public ResponseEntity<?> cancelOrder(@PathVariable String id) {
        try {
            ordersService.cancelOrder(id);
            return ResponseEntity.ok("Đã hủy đơn hàng thành công!");
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }
}