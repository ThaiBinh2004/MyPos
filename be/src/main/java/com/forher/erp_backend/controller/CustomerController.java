package com.forher.erp_backend.controller;

import com.forher.erp_backend.entity.Customer;
import com.forher.erp_backend.service.Interface.ICustomerService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/sales/customers")
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
}
