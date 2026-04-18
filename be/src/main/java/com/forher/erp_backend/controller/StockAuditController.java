package com.forher.erp_backend.controller;

import com.forher.erp_backend.entity.*;
import com.forher.erp_backend.repository.*;
import com.forher.erp_backend.service.Interface.IInventoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/sales/stock-audits")
@RequiredArgsConstructor
public class StockAuditController {

    private final StockAuditRepository auditRepo;
    private final BranchRepository branchRepo;
    private final ProductRepository productRepo;
    private final EmployeeRepository employeeRepo;
    private final InventoryRepository inventoryRepo;
    private final IInventoryService inventoryService;

    @GetMapping
    public ResponseEntity<?> getAll(@RequestParam(required = false) String branchId) {
        List<StockAudit> list = branchId != null && !branchId.isBlank()
                ? auditRepo.findByBranchBranchIdOrderByCreatedAtDesc(branchId)
                : auditRepo.findAllByOrderByCreatedAtDesc();
        return ResponseEntity.ok(list.stream().map(this::toMap).toList());
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody Map<String, Object> payload) {
        try {
            String branchId = (String) payload.get("branchId");
            String productId = (String) payload.get("productId");
            int actualQty = Integer.parseInt(payload.get("actualQuantity").toString());
            String note = (String) payload.get("note");
            String auditedById = (String) payload.get("auditedByEmployeeId");

            Branch branch = branchRepo.findById(branchId).orElseThrow(() -> new RuntimeException("Không tìm thấy chi nhánh."));
            Product product = productRepo.findById(productId).orElseThrow(() -> new RuntimeException("Không tìm thấy sản phẩm."));
            Employee auditedBy = auditedById != null ? employeeRepo.findById(auditedById).orElse(null) : null;

            // Get system quantity
            int systemQty = inventoryRepo.findAll().stream()
                    .filter(i -> i.getProduct().getProductId().equals(productId) && i.getBranch().getBranchId().equals(branchId))
                    .findFirst().map(Inventory::getQuantity).orElse(0);

            int diff = actualQty - systemQty;
            String id = "AUD" + String.format("%05d", auditRepo.count() + 1);

            StockAudit audit = StockAudit.builder()
                    .auditId(id).branch(branch).product(product)
                    .systemQuantity(systemQty).actualQuantity(actualQty).difference(diff)
                    .note(note).auditedBy(auditedBy)
                    .status(diff == 0 ? "RESOLVED" : "PENDING")
                    .build();
            return ResponseEntity.status(HttpStatus.CREATED).body(toMap(auditRepo.save(audit)));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PatchMapping("/{id}/resolve")
    public ResponseEntity<?> resolve(@PathVariable String id, @RequestBody Map<String, String> payload) {
        return auditRepo.findById(id).map(a -> {
            if (!"PENDING".equals(a.getStatus())) return ResponseEntity.badRequest().body("Phiếu đã được xử lý.");
            try {
                // Adjust inventory to match actual
                if (a.getDifference() != 0) {
                    inventoryService.updateStock(a.getProduct().getProductId(), a.getBranch().getBranchId(), a.getDifference());
                }
                a.setStatus("RESOLVED");
                a.setResolvedNote(payload.get("resolvedNote"));
                a.setResolvedAt(LocalDateTime.now());
                return ResponseEntity.ok(toMap(auditRepo.save(a)));
            } catch (RuntimeException e) {
                return ResponseEntity.badRequest().body(e.getMessage());
            }
        }).orElse(ResponseEntity.notFound().build());
    }

    private Map<String, Object> toMap(StockAudit a) {
        Map<String, Object> m = new HashMap<>();
        m.put("auditId", a.getAuditId());
        m.put("branchId", a.getBranch().getBranchId());
        m.put("branchName", a.getBranch().getBranchName());
        m.put("productId", a.getProduct().getProductId());
        m.put("productName", a.getProduct().getProductName());
        m.put("systemQuantity", a.getSystemQuantity());
        m.put("actualQuantity", a.getActualQuantity());
        m.put("difference", a.getDifference());
        m.put("status", a.getStatus());
        m.put("note", a.getNote() != null ? a.getNote() : "");
        m.put("resolvedNote", a.getResolvedNote() != null ? a.getResolvedNote() : "");
        m.put("createdAt", a.getCreatedAt() != null ? a.getCreatedAt().toString() : "");
        m.put("resolvedAt", a.getResolvedAt() != null ? a.getResolvedAt().toString() : null);
        return m;
    }
}
