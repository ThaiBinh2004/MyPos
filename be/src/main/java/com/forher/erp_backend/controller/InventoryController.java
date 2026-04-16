package com.forher.erp_backend.controller;

import com.forher.erp_backend.dto.InventoryResponse;
import com.forher.erp_backend.dto.PaginatedResponse;
import com.forher.erp_backend.service.Interface.IInventoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/sales/inventory")
@RequiredArgsConstructor
public class InventoryController {

    private final IInventoryService inventoryService;

    @GetMapping
    public ResponseEntity<?> getAll() {
        return ResponseEntity.ok(PaginatedResponse.of(
                inventoryService.getAllInventory().stream().map(InventoryResponse::from).toList()
        ));
    }
}
