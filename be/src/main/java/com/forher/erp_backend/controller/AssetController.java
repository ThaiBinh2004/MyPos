package com.forher.erp_backend.controller;

import com.forher.erp_backend.dto.AssetHandoverResponse;
import com.forher.erp_backend.dto.AssetResponse;
import com.forher.erp_backend.dto.PaginatedResponse;
import com.forher.erp_backend.entity.Asset;
import com.forher.erp_backend.entity.AssetHandover;
import com.forher.erp_backend.repository.EmployeeRepository;
import com.forher.erp_backend.service.Interface.IAssetHandoverService;
import com.forher.erp_backend.service.Interface.IAssetService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/hr/assets")
@RequiredArgsConstructor
public class AssetController {

    private final IAssetService assetService;
    private final IAssetHandoverService handoverService;
    private final EmployeeRepository employeeRepository;

    @GetMapping
    public ResponseEntity<?> getAll(@RequestParam(required = false) String employeeId) {
        var list = assetService.getAllAssets().stream()
                .filter(a -> employeeId == null || employeeId.isBlank()
                        || (a.getEmployee() != null && employeeId.equals(a.getEmployee().getEmployeeId())))
                .map(AssetResponse::from).toList();
        return ResponseEntity.ok(PaginatedResponse.of(list));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getById(@PathVariable String id) {
        try { return ResponseEntity.ok(AssetResponse.from(assetService.getAssetById(id))); }
        catch (RuntimeException e) { return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage()); }
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody Map<String, String> payload) {
        try {
            String assetName = payload.get("assetName");
            BigDecimal assetValue = payload.get("assetValue") != null ? new BigDecimal(payload.get("assetValue")) : BigDecimal.ZERO;
            String employeeId = payload.get("employeeId");
            String handoverDateStr = payload.get("handoverDate");

            Asset asset = Asset.builder()
                    .assetId("AS" + String.format("%05d", assetService.getAllAssets().size() + 1))
                    .assetName(assetName)
                    .assetType("—")
                    .assetValue(assetValue)
                    .assetCondition("TỐT")
                    .build();

            if (employeeId != null && !employeeId.isBlank()) {
                asset.setEmployee(employeeRepository.findById(employeeId)
                        .orElseThrow(() -> new RuntimeException("Không tìm thấy nhân viên")));
                asset.setHandoverDate(handoverDateStr != null ? LocalDate.parse(handoverDateStr) : LocalDate.now());
            }

            return ResponseEntity.status(HttpStatus.CREATED).body(AssetResponse.from(assetService.createAsset(asset)));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PatchMapping("/{id}/assign")
    public ResponseEntity<?> assign(@PathVariable String id, @RequestBody Map<String, String> payload) {
        try {
            Asset asset = assetService.getAssetById(id);
            String employeeId = payload.get("employeeId");
            if (employeeId != null && !employeeId.isBlank()) {
                asset.setEmployee(employeeRepository.findById(employeeId)
                        .orElseThrow(() -> new RuntimeException("Không tìm thấy nhân viên")));
                String dateStr = payload.get("handoverDate");
                asset.setHandoverDate(dateStr != null ? LocalDate.parse(dateStr) : LocalDate.now());
            } else {
                asset.setEmployee(null);
                asset.setHandoverDate(null);
            }
            return ResponseEntity.ok(AssetResponse.from(assetService.updateAsset(id, asset)));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
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
