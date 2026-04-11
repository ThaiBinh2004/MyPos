package com.forher.erp_backend.controller;

import com.forher.erp_backend.entity.Customer;
import com.forher.erp_backend.service.Interface.ICustomerService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/customers")
@RequiredArgsConstructor
public class CustomerController {

    private final ICustomerService customerService;

    @GetMapping
    public ResponseEntity<?> getAll() { return ResponseEntity.ok(customerService.getAllCustomers()); }

    @GetMapping("/{id}")
    public ResponseEntity<?> getById(@PathVariable String id) {
        try { return ResponseEntity.ok(customerService.getCustomerById(id)); }
        catch (RuntimeException e) { return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage()); }
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody Customer customer) {
        return ResponseEntity.status(HttpStatus.CREATED).body(customerService.createCustomer(customer));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable String id, @RequestBody Customer details) {
        return ResponseEntity.ok(customerService.updateCustomer(id, details));
    }

    // NGHIỆP VỤ: Cộng điểm & Tự động thăng hạng
    @PatchMapping("/{id}/add-points")
    public ResponseEntity<?> addPoints(@PathVariable String id, @RequestParam int points) {
        try {
            customerService.addLoyaltyPoints(id, points);
            return ResponseEntity.ok("Cộng điểm và cập nhật hạng thành công!");
        } catch (Exception e) { return ResponseEntity.badRequest().body(e.getMessage()); }
    }

    // NGHIỆP VỤ: Tiêu điểm
    @PatchMapping("/{id}/redeem-points")
    public ResponseEntity<?> redeemPoints(@PathVariable String id, @RequestParam int pointsToUse) {
        try {
            customerService.redeemPoints(id, pointsToUse);
            return ResponseEntity.ok("Đã trừ điểm thành công!");
        } catch (Exception e) { return ResponseEntity.badRequest().body(e.getMessage()); }
    }
}