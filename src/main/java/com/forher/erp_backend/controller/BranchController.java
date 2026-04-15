package com.forher.erp_backend.controller;

import com.forher.erp_backend.entity.Branch;
import com.forher.erp_backend.service.Interface.IBranchService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/branches")
@RequiredArgsConstructor
public class BranchController {

    private final IBranchService branchService;

    // NGHIỆP VỤ: Xem danh sách chi nhánh
    // Ai trong công ty cũng có quyền xem để tra cứu thông tin
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'EMPLOYEE')")
    @GetMapping
    public ResponseEntity<?> getAll() { return ResponseEntity.ok(branchService.getAllBranches()); }

    // NGHIỆP VỤ: Xem chi tiết 1 chi nhánh
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'EMPLOYEE')")
    @GetMapping("/{id}")
    public ResponseEntity<?> getById(@PathVariable String id) {
        try { return ResponseEntity.ok(branchService.getBranchById(id)); }
        catch (RuntimeException e) { return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage()); }
    }

    // NGHIỆP VỤ: Tạo chi nhánh mới
    // CHỈ ADMIN (Giám đốc) mới có quyền mở thêm chi nhánh
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public ResponseEntity<?> create(@RequestBody Branch branch) {
        return ResponseEntity.status(HttpStatus.CREATED).body(branchService.createBranch(branch));
    }

    // NGHIỆP VỤ: Cập nhật thông tin chi nhánh (Đổi tên, đổi địa chỉ)
    // CHỈ ADMIN (Giám đốc) mới có quyền sửa
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable String id, @RequestBody Branch details) {
        return ResponseEntity.ok(branchService.updateBranch(id, details));
    }

    // NGHIỆP VỤ: Xem tổng số nhân viên của một chi nhánh
    // Chỉ ADMIN và MANAGER mới cần thống kê nhân sự để quản lý
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @GetMapping("/{id}/total-employees")
    public ResponseEntity<?> getTotalEmployees(@PathVariable String id) {
        return ResponseEntity.ok("Tổng số nhân viên: " + branchService.getTotalEmployeesByBranch(id));
    }
}