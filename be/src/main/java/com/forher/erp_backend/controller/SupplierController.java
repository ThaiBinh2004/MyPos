package com.forher.erp_backend.controller;

import com.forher.erp_backend.entity.Supplier;
import com.forher.erp_backend.service.Interface.ISupplierService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/sales/suppliers")
@RequiredArgsConstructor
public class SupplierController {

    private final ISupplierService supplierService;

    @GetMapping
    public ResponseEntity<?> getAll() { return ResponseEntity.ok(supplierService.getAllSuppliers()); }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody Supplier supplier) {
        return ResponseEntity.status(HttpStatus.CREATED).body(supplierService.createSupplier(supplier));
    }
}
