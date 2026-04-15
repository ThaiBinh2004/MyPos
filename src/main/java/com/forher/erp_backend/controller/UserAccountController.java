package com.forher.erp_backend.controller;

import com.forher.erp_backend.entity.UserAccount;
import com.forher.erp_backend.service.Interface.IUserAccountService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/accounts")
@RequiredArgsConstructor
public class UserAccountController {

    private final IUserAccountService accountService;

    // CHỈ ADMIN mới được xem danh sách toàn bộ tài khoản
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping
    public ResponseEntity<?> getAllAccounts() {
        try {
            return ResponseEntity.ok(accountService.getAllAccounts());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }

    // CHỈ ADMIN mới được tạo tài khoản bằng tay từ đây
    @PreAuthorize("hasRole('ADMIN')")
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

    // NGHIỆP VỤ: Đổi mật khẩu (Ai cũng có thể tự đổi mật khẩu của mình)
    // Ví dụ: PATCH /api/v1/accounts/ACC_01/change-password?oldPass=123&newPass=456
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

    // NGHIỆP VỤ: Khóa/Mở khóa tài khoản (CHỈ ADMIN mới được làm)
    // SỬA LỖI: boolean đổi thành Integer (1: Mở, 0: Khóa)
    @PreAuthorize("hasRole('ADMIN')")
    @PatchMapping("/{id}/status")
    public ResponseEntity<?> toggleStatus(@PathVariable String id, @RequestParam Integer isActive) {
        try {
            accountService.toggleAccountStatus(id, isActive);
            String statusMsg = (isActive == 1) ? "Mở khóa" : "Khóa";
            return ResponseEntity.ok("Đã " + statusMsg + " tài khoản thành công!");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }
}