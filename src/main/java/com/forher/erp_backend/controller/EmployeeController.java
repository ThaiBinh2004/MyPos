package com.forher.erp_backend.controller;

import com.forher.erp_backend.entity.Employee;
import com.forher.erp_backend.service.Interface.IEmployeeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/employees")
@RequiredArgsConstructor
public class EmployeeController {

    private final IEmployeeService employeeService;

    // NGHIỆP VỤ: Xem danh sách toàn bộ nhân viên
    // Chỉ ADMIN và MANAGER được phép xem
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @GetMapping
    public ResponseEntity<?> getAllEmployees() {
        try {
            return ResponseEntity.ok(employeeService.getAllEmployees());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }

    // NGHIỆP VỤ: Xem chi tiết 1 hồ sơ nhân viên
    // Mở cho mọi người (Nhân viên cần xem hồ sơ của chính mình)
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'EMPLOYEE')")
    @GetMapping("/{id}")
    public ResponseEntity<?> getEmployeeById(@PathVariable String id) {
        try {
            return ResponseEntity.ok(employeeService.getEmployeeById(id));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }

    // NGHIỆP VỤ: Tạo hồ sơ nhân viên mới (Tiếp nhận nhân viên)
    // Chỉ ADMIN và MANAGER được thực hiện
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @PostMapping
    public ResponseEntity<?> createEmployee(@RequestBody Employee employee) {
        try {
            return ResponseEntity.status(HttpStatus.CREATED).body(employeeService.createEmployee(employee));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }

    // NGHIỆP VỤ: Cập nhật thông tin nhân viên
    // Mở cho mọi người (Nhân viên tự cập nhật thông tin cá nhân)
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'EMPLOYEE')")
    @PutMapping("/{id}")
    public ResponseEntity<?> updateEmployee(@PathVariable String id, @RequestBody Employee employee) {
        try {
            return ResponseEntity.ok(employeeService.updateEmployee(id, employee));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }

    // NGHIỆP VỤ: Cho nhân viên nghỉ việc
    // Chỉ ADMIN và MANAGER có quyền thay đổi trạng thái thành Nghỉ việc
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteEmployee(@PathVariable String id) {
        try {
            employeeService.resignEmployee(id);

            return ResponseEntity.ok("Đã chuyển trạng thái nhân viên thành Nghỉ việc!");
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }
}