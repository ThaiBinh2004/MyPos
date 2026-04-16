package com.forher.erp_backend.controller;

import com.forher.erp_backend.dto.OrderResponse;
import com.forher.erp_backend.dto.PaginatedResponse;
import com.forher.erp_backend.entity.Orders;
import com.forher.erp_backend.service.Interface.IOrdersService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/sales/orders")
@RequiredArgsConstructor
public class OrdersController {

    private final IOrdersService ordersService;

    @GetMapping
    public ResponseEntity<?> getAll() {
        return ResponseEntity.ok(PaginatedResponse.of(
                ordersService.getAllOrders().stream().map(OrderResponse::from).toList()
        ));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getById(@PathVariable String id) {
        try { return ResponseEntity.ok(OrderResponse.from(ordersService.getOrderById(id))); }
        catch (RuntimeException e) { return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage()); }
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody Orders order) {
        try {
            Orders created;
            if ("ONLINE".equalsIgnoreCase(order.getOrderType())) {
                created = ordersService.createOnlineOrder(order);
            } else {
                created = ordersService.createOfflineOrder(order);
            }
            return ResponseEntity.status(HttpStatus.CREATED).body(OrderResponse.from(created));
        } catch (Exception e) { return ResponseEntity.badRequest().body(e.getMessage()); }
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(@PathVariable String id, @RequestBody Map<String, String> payload) {
        try {
            String status = payload.get("status");
            if ("CANCELLED".equalsIgnoreCase(status)) ordersService.cancelOrder(id);
            else ordersService.processPayment(id, status);
            return ResponseEntity.ok("Đã cập nhật trạng thái đơn hàng.");
        } catch (Exception e) { return ResponseEntity.badRequest().body(e.getMessage()); }
    }
}
