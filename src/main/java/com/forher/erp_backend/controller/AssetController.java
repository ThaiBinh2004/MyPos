package com.forher.erp_backend.controller;

import com.forher.erp_backend.entity.Asset;
import com.forher.erp_backend.service.Interface.IAssetService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/assets")
@RequiredArgsConstructor
public class AssetController {

    private final IAssetService assetService;

    // CHỈ ADMIN và MANAGER được xem toàn bộ danh sách tài sản công ty
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @GetMapping
    public ResponseEntity<?> getAllAssets() {
        try {
            return ResponseEntity.ok(assetService.getAllAssets());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Lỗi server: " + e.getMessage());
        }
    }

    // CHỈ ADMIN và MANAGER được tra cứu thông tin chi tiết 1 tài sản
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @GetMapping("/{id}")
    public ResponseEntity<?> getAssetById(@PathVariable String id) {
        try {
            return ResponseEntity.ok(assetService.getAssetById(id));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Lỗi server: " + e.getMessage());
        }
    }

    // CHỈ ADMIN và MANAGER được thêm tài sản mới (khi công ty mua thêm)
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @PostMapping
    public ResponseEntity<?> createAsset(@RequestBody Asset asset) {
        try {
            return ResponseEntity.status(HttpStatus.CREATED).body(assetService.createAsset(asset));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Lỗi server: " + e.getMessage());
        }
    }

    // CHỈ ADMIN và MANAGER được cập nhật tài sản (đổi trạng thái hư hỏng, đổi người giữ...)
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @PutMapping("/{id}")
    public ResponseEntity<?> updateAsset(@PathVariable String id, @RequestBody Asset assetDetails) {
        try {
            return ResponseEntity.ok(assetService.updateAsset(id, assetDetails));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Lỗi server: " + e.getMessage());
        }
    }

    // CHỈ ADMIN và MANAGER được xóa tài sản (hoặc thanh lý)
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteAsset(@PathVariable String id) {
        try {
            assetService.deleteAsset(id);
            return ResponseEntity.ok("Xóa tài sản thành công!");
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Lỗi server: " + e.getMessage());
        }
    }
}