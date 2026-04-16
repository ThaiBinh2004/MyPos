package com.forher.erp_backend.controller;

import com.forher.erp_backend.dto.ContractResponse;
import com.forher.erp_backend.dto.PaginatedResponse;
import com.forher.erp_backend.entity.Contract;
import com.forher.erp_backend.service.Interface.IContractService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequiredArgsConstructor
public class ContractController {

    private final IContractService contractService;

    @GetMapping("/api/v1/hr/contracts")
    public ResponseEntity<?> getAll() {
        return ResponseEntity.ok(PaginatedResponse.of(
                contractService.getAllContracts().stream().map(ContractResponse::from).toList()
        ));
    }

    @GetMapping("/api/v1/hr/contracts/{id}")
    public ResponseEntity<?> getById(@PathVariable String id) {
        try { return ResponseEntity.ok(ContractResponse.from(contractService.getContractById(id))); }
        catch (RuntimeException e) { return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage()); }
    }

    @GetMapping("/api/v1/hr/employees/{employeeId}/contracts")
    public ResponseEntity<?> getByEmployee(@PathVariable String employeeId) {
        return ResponseEntity.ok(contractService.getContractsByEmployee(employeeId).stream()
                .map(ContractResponse::from).toList());
    }

    @PostMapping("/api/v1/hr/contracts")
    public ResponseEntity<?> create(@RequestBody Contract contract) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ContractResponse.from(contractService.createContract(contract)));
    }

    @PatchMapping("/api/v1/hr/contracts/{id}")
    public ResponseEntity<?> update(@PathVariable String id, @RequestBody Contract details) {
        try { return ResponseEntity.ok(ContractResponse.from(contractService.updateContract(id, details))); }
        catch (RuntimeException e) { return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage()); }
    }

    @PostMapping("/api/v1/hr/contracts/{id}/approve")
    public ResponseEntity<?> approve(@PathVariable String id, @RequestBody(required = false) Map<String, String> body) {
        try {
            return ResponseEntity.ok(ContractResponse.from(contractService.renewContract(id, 0)));
        } catch (Exception e) { return ResponseEntity.badRequest().body(e.getMessage()); }
    }

    @PostMapping("/api/v1/hr/contracts/{id}/terminate")
    public ResponseEntity<?> terminate(@PathVariable String id, @RequestBody(required = false) Map<String, String> body) {
        try {
            contractService.terminateContract(id);
            return ResponseEntity.ok("Đã chấm dứt hợp đồng.");
        } catch (Exception e) { return ResponseEntity.badRequest().body(e.getMessage()); }
    }

    @GetMapping("/api/v1/hr/contracts/expiring")
    public ResponseEntity<?> getExpiring(@RequestParam(defaultValue = "30") int days) {
        return ResponseEntity.ok(contractService.getExpiringContracts(days).stream()
                .map(ContractResponse::from).toList());
    }
}
