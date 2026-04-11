package com.forher.erp_backend.controller;

import com.forher.erp_backend.entity.Contract;
import com.forher.erp_backend.service.Interface.IContractService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/contracts")
@RequiredArgsConstructor
public class ContractController {

    private final IContractService contractService;

    @GetMapping
    public ResponseEntity<?> getAll() { return ResponseEntity.ok(contractService.getAllContracts()); }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody Contract contract) {
        return ResponseEntity.status(HttpStatus.CREATED).body(contractService.createContract(contract));
    }

    // NGHIỆP VỤ: Lấy danh sách hợp đồng sắp hết hạn (ví dụ: trong 30 ngày)
    @GetMapping("/expiring")
    public ResponseEntity<?> getExpiringContracts(@RequestParam(defaultValue = "30") int days) {
        return ResponseEntity.ok(contractService.getExpiringContracts(days));
    }

    // NGHIỆP VỤ: Gia hạn hợp đồng
    @PatchMapping("/{id}/renew")
    public ResponseEntity<?> renewContract(@PathVariable String id, @RequestParam int monthsToAdd) {
        try {
            return ResponseEntity.ok(contractService.renewContract(id, monthsToAdd));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}