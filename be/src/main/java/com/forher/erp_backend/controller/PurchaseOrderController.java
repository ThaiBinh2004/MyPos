package com.forher.erp_backend.controller;

import com.forher.erp_backend.dto.PurchaseOrderResponse;
import com.forher.erp_backend.entity.*;
import com.forher.erp_backend.repository.*;
import com.forher.erp_backend.service.Interface.IPurchaseOrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/sales/purchase-orders")
@RequiredArgsConstructor
public class PurchaseOrderController {

    private final IPurchaseOrderService purchaseOrderService;
    private final SupplierRepository supplierRepository;
    private final BranchRepository branchRepository;
    private final ProductRepository productRepository;
    private final PurchaseOrderDetailRepository purchaseOrderDetailRepository;
    private final PurchaseOrderRepository purchaseOrderRepository;

    @GetMapping
    public ResponseEntity<?> getAll() {
        return ResponseEntity.ok(purchaseOrderService.getAllPurchaseOrders().stream()
                .map(PurchaseOrderResponse::from).toList());
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody PurchaseOrder purchaseOrder) {
        return ResponseEntity.status(HttpStatus.CREATED).body(
                PurchaseOrderResponse.from(purchaseOrderService.createPurchaseOrder(purchaseOrder))
        );
    }

    @PostMapping("/create")
    @Transactional
    public ResponseEntity<?> createFull(@RequestBody Map<String, Object> body) {
        try {
            String supplierId = (String) body.get("supplierId");
            String branchId = (String) body.get("branchId");
            String note = (String) body.get("note");

            Supplier supplier = supplierRepository.findById(supplierId)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy nhà cung cấp"));
            Branch branch = branchRepository.findById(branchId)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy chi nhánh"));

            long count = purchaseOrderRepository.count();
            String poId = String.format("PO%03d", count + 1);

            PurchaseOrder po = purchaseOrderRepository.save(PurchaseOrder.builder()
                    .poId(poId).supplier(supplier).branch(branch)
                    .orderDate(LocalDate.now()).status("PENDING").note(note).build());

            @SuppressWarnings("unchecked")
            List<Map<String, Object>> details = (List<Map<String, Object>>) body.get("details");
            int idx = 1;
            for (Map<String, Object> d : details) {
                String productId = (String) d.get("productId");
                int qty = ((Number) d.get("quantityOrdered")).intValue();
                Product product = productRepository.findById(productId)
                        .orElseThrow(() -> new RuntimeException("Không tìm thấy sản phẩm"));
                String detailId = poId + "-D" + String.format("%02d", idx++);
                purchaseOrderDetailRepository.save(PurchaseOrderDetail.builder()
                        .detailId(detailId).purchaseOrder(po).product(product)
                        .quantityOrdered(qty).quantityReceived(0).build());
            }

            return ResponseEntity.status(HttpStatus.CREATED).body(PurchaseOrderResponse.from(po));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/{id}/receive")
    public ResponseEntity<?> receive(@PathVariable String id) {
        try {
            purchaseOrderService.receiveGoods(id);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
