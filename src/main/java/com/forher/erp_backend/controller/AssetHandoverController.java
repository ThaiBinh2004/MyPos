package com.forher.erp_backend.controller;

import com.forher.erp_backend.service.Interface.IAssetHandoverService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/asset-handovers")
@RequiredArgsConstructor
public class AssetHandoverController {

    private final IAssetHandoverService handoverService;

    // NGHIỆP VỤ: Thu hồi tài sản tự động khi nhân viên nghỉ việc
    // CHỈ ADMIN và MANAGER được phép thực hiện lập biên bản thu hồi
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @PostMapping("/revoke/{employeeId}")
    public ResponseEntity<?> createRevokeHandover(@PathVariable String employeeId) {
        try {
            handoverService.createRevokeHandover(employeeId);
            return ResponseEntity.ok("Đã tạo biên bản thu hồi tài sản thành công!");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}