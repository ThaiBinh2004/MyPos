package com.forher.erp_backend.controller;

import com.forher.erp_backend.entity.UserAccount;
import com.forher.erp_backend.service.Interface.IUserAccountService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/accounts")
@RequiredArgsConstructor
public class UserAccountController {

    private final IUserAccountService accountService;

    @GetMapping
    public ResponseEntity<?> getAllAccounts() {
        try {
            return ResponseEntity.ok(accountService.getAllAccounts());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }

    @PostMapping
    public ResponseEntity<?> createAccount(@RequestBody UserAccount account) {
        try {
            return ResponseEntity.status(HttpStatus.CREATED).body(accountService.createAccount(account));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }

    // NGHIỆP VỤ: Đổi mật khẩu
    // Ví dụ: PATCH /api/v1/accounts/ACC01/change-password?oldPass=123&newPass=456
    @PatchMapping("/{id}/change-password")
    public ResponseEntity<?> changePassword(@PathVariable String id, @RequestParam String oldPass, @RequestParam String newPass) {
        try {
            accountService.changePassword(id, oldPass, newPass);
            return ResponseEntity.ok("Đổi mật khẩu thành công!");
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }

    // NGHIỆP VỤ: Khóa/Mở khóa tài khoản
    @PatchMapping("/{id}/status")
    public ResponseEntity<?> toggleStatus(@PathVariable String id, @RequestParam boolean isActive) {
        try {
            accountService.toggleAccountStatus(id, isActive);
            return ResponseEntity.ok("Cập nhật trạng thái tài khoản thành công!");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }
}