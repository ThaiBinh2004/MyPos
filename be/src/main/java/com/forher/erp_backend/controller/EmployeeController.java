package com.forher.erp_backend.controller;

import com.forher.erp_backend.dto.EmployeeResponse;
import com.forher.erp_backend.dto.PaginatedResponse;
import com.forher.erp_backend.entity.Employee;
import com.forher.erp_backend.service.Interface.IEmployeeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/hr/employees")
@RequiredArgsConstructor
public class EmployeeController {

    private final IEmployeeService employeeService;

    @GetMapping
    public ResponseEntity<?> getAll() {
        return ResponseEntity.ok(PaginatedResponse.of(
                employeeService.getAllEmployees().stream().map(EmployeeResponse::from).toList()
        ));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getById(@PathVariable String id) {
        try { return ResponseEntity.ok(EmployeeResponse.from(employeeService.getEmployeeById(id))); }
        catch (RuntimeException e) { return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage()); }
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody Employee employee) {
        try { return ResponseEntity.status(HttpStatus.CREATED).body(EmployeeResponse.from(employeeService.createEmployee(employee))); }
        catch (Exception e) { return ResponseEntity.badRequest().body(e.getMessage()); }
    }

    @PatchMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable String id, @RequestBody Employee employee) {
        try { return ResponseEntity.ok(EmployeeResponse.from(employeeService.updateEmployee(id, employee))); }
        catch (RuntimeException e) { return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage()); }
    }

    @PatchMapping("/{id}/deactivate")
    public ResponseEntity<?> deactivate(@PathVariable String id) {
        try { employeeService.resignEmployee(id); return ResponseEntity.ok("Đã vô hiệu hóa nhân viên."); }
        catch (RuntimeException e) { return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage()); }
    }
}
