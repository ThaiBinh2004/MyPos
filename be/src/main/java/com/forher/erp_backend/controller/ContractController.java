package com.forher.erp_backend.controller;

import com.forher.erp_backend.dto.ContractResponse;
import com.forher.erp_backend.entity.Contract;
import com.forher.erp_backend.service.Interface.IContractService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/hr/contracts")
@RequiredArgsConstructor
public class ContractController {

    private final IContractService contractService;

    @GetMapping
    public ResponseEntity<?> getAll(
            @RequestParam(required = false) String branchId,
            @RequestParam(required = false) String status
    ) {
        List<ContractResponse> list = contractService.getAllContracts(branchId, status)
                .stream().map(ContractResponse::from).toList();
        return ResponseEntity.ok(list);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getById(@PathVariable String id) {
        try { return ResponseEntity.ok(ContractResponse.from(contractService.getContractById(id))); }
        catch (RuntimeException e) { return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage()); }
    }

    @GetMapping("/by-employee/{employeeId}")
    public ResponseEntity<?> getByEmployee(@PathVariable String employeeId) {
        return ResponseEntity.ok(contractService.getContractsByEmployee(employeeId)
                .stream().map(ContractResponse::from).toList());
    }

    @GetMapping("/expiring")
    public ResponseEntity<?> getExpiring(
            @RequestParam(defaultValue = "30") int days,
            @RequestParam(required = false) String branchId
    ) {
        return ResponseEntity.ok(contractService.getExpiringContracts(days, branchId)
                .stream().map(ContractResponse::from).toList());
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody Map<String, Object> body) {
        try {
            String employeeId   = body.get("employeeId") != null ? body.get("employeeId").toString() : null;
            String contractType = body.get("contractType") != null ? body.get("contractType").toString() : null;
            String startDate    = body.get("startDate") != null ? body.get("startDate").toString() : null;

            if (employeeId == null || employeeId.isBlank())
                return ResponseEntity.badRequest().body("Vui lòng chọn nhân viên!");
            if (contractType == null || contractType.isBlank())
                return ResponseEntity.badRequest().body("Vui lòng chọn loại hợp đồng!");
            if (startDate == null || startDate.isBlank())
                return ResponseEntity.badRequest().body("Vui lòng nhập ngày bắt đầu!");

            Object endDateRaw = body.get("endDate");
            String endDate = (endDateRaw != null && !endDateRaw.toString().isBlank()) ? endDateRaw.toString() : null;

            Object salaryRaw = body.get("baseSalary");
            if (salaryRaw == null) return ResponseEntity.badRequest().body("Mức lương không được để trống!");
            BigDecimal baseSalary = new BigDecimal(salaryRaw.toString());
            Object allowanceRaw = body.get("allowance");
            BigDecimal allowance = (allowanceRaw != null && !allowanceRaw.toString().isBlank())
                    ? new BigDecimal(allowanceRaw.toString()) : BigDecimal.ZERO;
            String position     = body.get("position") != null ? body.get("position").toString() : null;
            String workingHours = body.get("workingHours") != null ? body.get("workingHours").toString() : null;
            String leavePolicy  = body.get("leavePolicy") != null ? body.get("leavePolicy").toString() : null;
            String otherTerms   = body.get("otherTerms") != null ? body.get("otherTerms").toString() : null;

            return ResponseEntity.status(HttpStatus.CREATED).body(ContractResponse.from(
                    contractService.createContract(employeeId, contractType, startDate, endDate,
                            baseSalary, allowance, position, workingHours, leavePolicy, otherTerms)
            ));
        } catch (Exception e) {
            e.printStackTrace(); // in log BE để debug
            String msg = e.getMessage() != null ? e.getMessage() : e.getClass().getSimpleName();
            return ResponseEntity.badRequest().body(msg);
        }
    }

    @PatchMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable String id, @RequestBody Contract details) {
        try { return ResponseEntity.ok(ContractResponse.from(contractService.updateContract(id, details))); }
        catch (RuntimeException e) { return ResponseEntity.badRequest().body(e.getMessage()); }
    }

    // Branch manager gửi lên director duyệt
    @PostMapping("/{id}/submit")
    public ResponseEntity<?> submit(@PathVariable String id) {
        try { return ResponseEntity.ok(ContractResponse.from(contractService.submitContract(id))); }
        catch (RuntimeException e) { return ResponseEntity.badRequest().body(e.getMessage()); }
    }

    // Director duyệt
    @PostMapping("/{id}/approve")
    public ResponseEntity<?> approve(@PathVariable String id, @RequestBody(required = false) Map<String, String> body) {
        try {
            String approvedById  = body != null ? body.get("approvedById") : null;
            String reviewerNote  = body != null ? body.get("reviewerNote") : null;
            return ResponseEntity.ok(ContractResponse.from(contractService.approveContract(id, approvedById, reviewerNote)));
        } catch (Exception e) { return ResponseEntity.badRequest().body(e.getMessage()); }
    }

    // Director từ chối
    @PostMapping("/{id}/reject")
    public ResponseEntity<?> reject(@PathVariable String id, @RequestBody(required = false) Map<String, String> body) {
        try {
            String reviewerNote = body != null ? body.get("reviewerNote") : null;
            return ResponseEntity.ok(ContractResponse.from(contractService.rejectContract(id, reviewerNote)));
        } catch (Exception e) { return ResponseEntity.badRequest().body(e.getMessage()); }
    }

    // Director chấm dứt
    @PostMapping("/{id}/terminate")
    public ResponseEntity<?> terminate(@PathVariable String id) {
        try {
            contractService.terminateContract(id);
            return ResponseEntity.ok("Đã chấm dứt hợp đồng.");
        } catch (Exception e) { return ResponseEntity.badRequest().body(e.getMessage()); }
    }

    // Nhân viên ký xác nhận
    @PostMapping("/{id}/sign")
    public ResponseEntity<?> sign(@PathVariable String id) {
        try { return ResponseEntity.ok(ContractResponse.from(contractService.signContract(id))); }
        catch (Exception e) { return ResponseEntity.badRequest().body(e.getMessage()); }
    }
}
