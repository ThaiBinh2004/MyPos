package com.forher.erp_backend.controller;

import com.forher.erp_backend.entity.Supplier;
import com.forher.erp_backend.service.Interface.ISupplierService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/suppliers")
@RequiredArgsConstructor
public class SupplierController {

    private final ISupplierService supplierService;

    // NGHIỆP VỤ: Xem danh sách nhà cung cấp
    // Mở cho Nhân viên kho, Quản lý và Giám đốc
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'EMPLOYEE')")
    @GetMapping
    public ResponseEntity<?> getAll() {
        return ResponseEntity.ok(supplierService.getAllSuppliers());
    }

    // NGHIỆP VỤ: Thêm nhà cung cấp mới
    // Chỉ Quản lý và Giám đốc được phép thiết lập đối tác mới
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @PostMapping
    public ResponseEntity<?> create(@RequestBody Supplier supplier) {
        return ResponseEntity.status(HttpStatus.CREATED).body(supplierService.createSupplier(supplier));
    }

    // NGHIỆP VỤ: Cập nhật thông tin nhà cung cấp
    // Chỉ Quản lý và Giám đốc được phép thay đổi thông tin đối tác
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable String id, @RequestBody Supplier details) {
        try {
            return ResponseEntity.ok(supplierService.updateSupplier(id, details));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}