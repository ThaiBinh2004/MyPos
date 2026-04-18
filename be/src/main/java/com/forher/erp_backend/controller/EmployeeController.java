package com.forher.erp_backend.controller;

import com.forher.erp_backend.dto.EmployeeResponse;
import com.forher.erp_backend.dto.PaginatedResponse;
import com.forher.erp_backend.entity.Employee;
import com.forher.erp_backend.entity.UserAccount;
import com.forher.erp_backend.repository.UserAccountRepository;
import com.forher.erp_backend.service.Interface.IEmployeeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/hr/employees")
@RequiredArgsConstructor
public class EmployeeController {

    private final IEmployeeService employeeService;
    private final UserAccountRepository userAccountRepository;
    private final PasswordEncoder passwordEncoder;

    @GetMapping
    public ResponseEntity<?> getAll(@RequestParam(required = false) String branchId) {
        List<Employee> list = branchId != null && !branchId.isBlank()
                ? employeeService.getEmployeesByBranch(branchId)
                : employeeService.getAllEmployees();
        return ResponseEntity.ok(PaginatedResponse.of(list.stream().map(EmployeeResponse::from).toList()));
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

    // Director/Manager: cập nhật toàn bộ thông tin
    @PatchMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable String id, @RequestBody Employee employee) {
        try { return ResponseEntity.ok(EmployeeResponse.from(employeeService.updateEmployee(id, employee))); }
        catch (RuntimeException e) { return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage()); }
    }

    // Employee: chỉ cập nhật số điện thoại, địa chỉ, tài khoản ngân hàng của chính mình
    @PatchMapping("/{id}/self")
    public ResponseEntity<?> selfUpdate(@PathVariable String id, @RequestBody Map<String, String> body) {
        try {
            return ResponseEntity.ok(EmployeeResponse.from(employeeService.selfUpdate(
                    id,
                    body.get("phoneNumber"),
                    body.get("address"),
                    body.get("bankAccount")
            )));
        } catch (RuntimeException e) { return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage()); }
    }

    @PatchMapping("/{id}/shift")
    public ResponseEntity<?> updateShift(@PathVariable String id, @RequestBody Map<String, String> body) {
        try { return ResponseEntity.ok(EmployeeResponse.from(employeeService.updateShift(id, body.get("defaultShift")))); }
        catch (RuntimeException e) { return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage()); }
    }

    @PatchMapping("/{id}/deactivate")
    public ResponseEntity<?> deactivate(@PathVariable String id) {
        try { employeeService.resignEmployee(id); return ResponseEntity.ok("Đã vô hiệu hóa nhân viên."); }
        catch (RuntimeException e) { return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage()); }
    }

    @PatchMapping("/{id}/account/change-password")
    public ResponseEntity<?> changePassword(@PathVariable String id, @RequestBody Map<String, String> payload) {
        try {
            UserAccount account = userAccountRepository.findByEmployeeEmployeeId(id)
                    .orElseThrow(() -> new RuntimeException("Nhân viên chưa có tài khoản."));
            if (!passwordEncoder.matches(payload.get("oldPassword"), account.getPassword())) {
                return ResponseEntity.badRequest().body("Mật khẩu cũ không chính xác.");
            }
            account.setPassword(passwordEncoder.encode(payload.get("newPassword")));
            userAccountRepository.save(account);
            return ResponseEntity.ok("Đổi mật khẩu thành công.");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/{id}/account")
    public ResponseEntity<?> getAccount(@PathVariable String id) {
        return userAccountRepository.findByEmployeeEmployeeId(id)
                .map(a -> ResponseEntity.ok(Map.of(
                        "accountId", a.getAccountId(),
                        "username", a.getUsername(),
                        "role", a.getRole() != null ? a.getRole() : "",
                        "isActive", a.getIsActive()
                )))
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND).build());
    }

    @PostMapping("/{id}/account")
    public ResponseEntity<?> createAccount(@PathVariable String id, @RequestBody Map<String, String> payload) {
        try {
            if (userAccountRepository.findByEmployeeEmployeeId(id).isPresent()) {
                return ResponseEntity.badRequest().body("Nhân viên đã có tài khoản.");
            }
            Employee emp = employeeService.getEmployeeById(id);
            String username = payload.get("username");
            String password = payload.get("password");
            String role     = payload.getOrDefault("role", "employee");

            if (userAccountRepository.findByUsername(username).isPresent()) {
                return ResponseEntity.badRequest().body("Tên đăng nhập đã tồn tại.");
            }

            long count = userAccountRepository.count();
            UserAccount account = UserAccount.builder()
                    .accountId("ACC" + String.format("%03d", count + 1))
                    .username(username)
                    .password(passwordEncoder.encode(password))
                    .role(role)
                    .isActive(true)
                    .employee(emp)
                    .build();

            userAccountRepository.save(account);
            return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                    "accountId", account.getAccountId(),
                    "username", account.getUsername(),
                    "role", account.getRole()
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
