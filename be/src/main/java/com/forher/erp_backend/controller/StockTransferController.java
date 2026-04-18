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
@RequestMapping("/api/v1/sales/stock-transfers")
@RequiredArgsConstructor
public class StockTransferController {

    private final StockTransferRepository transferRepo;
    private final BranchRepository branchRepo;
    private final ProductRepository productRepo;
    private final EmployeeRepository employeeRepo;
    private final IInventoryService inventoryService;

    @GetMapping
    public ResponseEntity<?> getAll(@RequestParam(required = false) String branchId) {
        List<StockTransfer> list = branchId != null && !branchId.isBlank()
                ? transferRepo.findByFromBranchBranchIdOrToBranchBranchIdOrderByCreatedAtDesc(branchId, branchId)
                : transferRepo.findAllByOrderByCreatedAtDesc();
        return ResponseEntity.ok(list.stream().map(this::toMap).toList());
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody Map<String, Object> payload) {
        try {
            String fromBranchId = (String) payload.get("fromBranchId");
            String toBranchId = (String) payload.get("toBranchId");
            String productId = (String) payload.get("productId");
            int quantity = Integer.parseInt(payload.get("quantity").toString());
            String note = (String) payload.get("note");
            String createdById = (String) payload.get("createdByEmployeeId");

            if (fromBranchId.equals(toBranchId)) return ResponseEntity.badRequest().body("Chi nhánh nguồn và đích không được trùng nhau.");

            Branch from = branchRepo.findById(fromBranchId).orElseThrow(() -> new RuntimeException("Không tìm thấy chi nhánh nguồn."));
            Branch to = branchRepo.findById(toBranchId).orElseThrow(() -> new RuntimeException("Không tìm thấy chi nhánh đích."));
            Product product = productRepo.findById(productId).orElseThrow(() -> new RuntimeException("Không tìm thấy sản phẩm."));
            Employee createdBy = createdById != null ? employeeRepo.findById(createdById).orElse(null) : null;

            String id = "TF" + String.format("%06d", transferRepo.count() + 1);
            StockTransfer transfer = StockTransfer.builder()
                    .transferId(id).fromBranch(from).toBranch(to)
                    .product(product).quantity(quantity).note(note).createdBy(createdBy)
                    .status("PENDING").build();
            return ResponseEntity.status(HttpStatus.CREATED).body(toMap(transferRepo.save(transfer)));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PatchMapping("/{id}/complete")
    public ResponseEntity<?> complete(@PathVariable String id) {
        return transferRepo.findById(id).map(t -> {
            if (!"PENDING".equals(t.getStatus())) return ResponseEntity.badRequest().body("Phiếu không ở trạng thái chờ.");
            try {
                inventoryService.updateStock(t.getProduct().getProductId(), t.getFromBranch().getBranchId(), -t.getQuantity());
                inventoryService.updateStock(t.getProduct().getProductId(), t.getToBranch().getBranchId(), t.getQuantity());
                t.setStatus("COMPLETED");
                t.setCompletedAt(LocalDateTime.now());
                return ResponseEntity.ok(toMap(transferRepo.save(t)));
            } catch (RuntimeException e) {
                return ResponseEntity.badRequest().body(e.getMessage());
            }
        }).orElse(ResponseEntity.notFound().build());
    }

    @PatchMapping("/{id}/cancel")
    public ResponseEntity<?> cancel(@PathVariable String id) {
        return transferRepo.findById(id).map(t -> {
            if (!"PENDING".equals(t.getStatus())) return ResponseEntity.badRequest().body("Chỉ hủy được phiếu đang chờ.");
            t.setStatus("CANCELLED");
            return ResponseEntity.ok(toMap(transferRepo.save(t)));
        }).orElse(ResponseEntity.notFound().build());
    }

    private Map<String, Object> toMap(StockTransfer t) {
        Map<String, Object> m = new HashMap<>();
        m.put("transferId", t.getTransferId());
        m.put("fromBranchId", t.getFromBranch().getBranchId());
        m.put("fromBranchName", t.getFromBranch().getBranchName());
        m.put("toBranchId", t.getToBranch().getBranchId());
        m.put("toBranchName", t.getToBranch().getBranchName());
        m.put("productId", t.getProduct().getProductId());
        m.put("productName", t.getProduct().getProductName());
        m.put("quantity", t.getQuantity());
        m.put("status", t.getStatus());
        m.put("note", t.getNote() != null ? t.getNote() : "");
        m.put("createdAt", t.getCreatedAt() != null ? t.getCreatedAt().toString() : "");
        return m;
    }
}
