package com.forher.erp_backend.controller;

import com.forher.erp_backend.entity.Contract;
import com.forher.erp_backend.service.Interface.IContractService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/contracts")
@RequiredArgsConstructor
public class ContractController {

    private final IContractService contractService;

    // NGHIỆP VỤ: Xem toàn bộ danh sách hợp đồng
    // Chỉ ADMIN và MANAGER được phép xem danh sách tổng
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @GetMapping
    public ResponseEntity<?> getAll() { return ResponseEntity.ok(contractService.getAllContracts()); }

    // NGHIỆP VỤ: Tạo hợp đồng mới
    // Chỉ ADMIN và MANAGER được quyền lập hợp đồng
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @PostMapping
    public ResponseEntity<?> create(@RequestBody Contract contract) {
        return ResponseEntity.status(HttpStatus.CREATED).body(contractService.createContract(contract));
    }

    // NGHIỆP VỤ: Lấy danh sách hợp đồng sắp hết hạn (ví dụ: trong 30 ngày)
    // Hệ thống tự động cảnh báo cho Quản lý và Giám đốc
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @GetMapping("/expiring")
    public ResponseEntity<?> getExpiringContracts(@RequestParam(defaultValue = "30") int days) {
        return ResponseEntity.ok(contractService.getExpiringContracts(days));
    }

    // NGHIỆP VỤ: Gia hạn hợp đồng
    // Chỉ ADMIN và MANAGER được quyền thay đổi thời hạn
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @PatchMapping("/{id}/renew")
    public ResponseEntity<?> renewContract(@PathVariable String id, @RequestParam int monthsToAdd) {
        try {
            return ResponseEntity.ok(contractService.renewContract(id, monthsToAdd));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}