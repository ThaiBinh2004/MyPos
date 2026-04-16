package com.forher.erp_backend.controller;

import com.forher.erp_backend.dto.AssetHandoverResponse;
import com.forher.erp_backend.dto.AssetResponse;
import com.forher.erp_backend.dto.PaginatedResponse;
import com.forher.erp_backend.entity.Asset;
import com.forher.erp_backend.entity.AssetHandover;
import com.forher.erp_backend.service.Interface.IAssetHandoverService;
import com.forher.erp_backend.service.Interface.IAssetService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/hr/assets")
@RequiredArgsConstructor
public class AssetController {

    private final IAssetService assetService;
    private final IAssetHandoverService handoverService;

    @GetMapping
    public ResponseEntity<?> getAll() {
        return ResponseEntity.ok(PaginatedResponse.of(
                assetService.getAllAssets().stream().map(AssetResponse::from).toList()
        ));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getById(@PathVariable String id) {
        try { return ResponseEntity.ok(AssetResponse.from(assetService.getAssetById(id))); }
        catch (RuntimeException e) { return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage()); }
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody Asset asset) {
        return ResponseEntity.status(HttpStatus.CREATED).body(AssetResponse.from(assetService.createAsset(asset)));
    }

    @PatchMapping("/{id}/condition")
    public ResponseEntity<?> updateCondition(@PathVariable String id, @RequestBody Map<String, String> payload) {
        try {
            assetService.updateAssetCondition(id, payload.get("assetCondition"));
            return ResponseEntity.ok("Đã cập nhật tình trạng tài sản.");
        } catch (Exception e) { return ResponseEntity.badRequest().body(e.getMessage()); }
    }

    @GetMapping("/handovers")
    public ResponseEntity<?> getHandovers() {
        return ResponseEntity.ok(handoverService.getAllHandovers().stream()
                .map(AssetHandoverResponse::from).toList());
    }

    @PostMapping("/handovers")
    public ResponseEntity<?> createHandover(@RequestBody AssetHandover handover) {
        return ResponseEntity.status(HttpStatus.CREATED).body(
                AssetHandoverResponse.from(handoverService.createHandover(handover))
        );
    }
}
