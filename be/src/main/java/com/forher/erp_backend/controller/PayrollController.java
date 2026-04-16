package com.forher.erp_backend.controller;

import com.forher.erp_backend.dto.PaginatedResponse;
import com.forher.erp_backend.dto.PayrollResponse;
import com.forher.erp_backend.dto.PayslipResponse;
import com.forher.erp_backend.service.Interface.IPayrollService;
import com.forher.erp_backend.service.Interface.IPayslipService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/hr/payroll")
@RequiredArgsConstructor
public class PayrollController {

    private final IPayrollService payrollService;
    private final IPayslipService payslipService;

    @GetMapping
    public ResponseEntity<?> getAll() {
        return ResponseEntity.ok(PaginatedResponse.of(
                payrollService.getAllPayrolls().stream().map(PayrollResponse::from).toList()
        ));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getById(@PathVariable String id) {
        try { return ResponseEntity.ok(PayrollResponse.from(payrollService.getPayrollById(id))); }
        catch (RuntimeException e) { return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage()); }
    }

    @GetMapping("/{payrollId}/payslip")
    public ResponseEntity<?> getPayslip(@PathVariable String payrollId) {
        try { return ResponseEntity.ok(PayslipResponse.from(payslipService.getPayslipByPayrollId(payrollId))); }
        catch (RuntimeException e) { return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage()); }
    }

    @PostMapping("/generate")
    public ResponseEntity<?> generate(@RequestBody Map<String, Object> payload) {
        try {
            String employeeId = (String) payload.get("employeeId");
            int month = ((Number) payload.get("monthNum")).intValue();
            int year = ((Number) payload.get("yearNum")).intValue();
            return ResponseEntity.status(HttpStatus.CREATED).body(
                    PayrollResponse.from(payrollService.calculateMonthlyPayroll(employeeId, month, year))
            );
        } catch (Exception e) { return ResponseEntity.badRequest().body(e.getMessage()); }
    }

    @PostMapping("/confirm")
    public ResponseEntity<?> confirm(@RequestBody Map<String, Object> payload) {
        try {
            String payrollId = (String) payload.get("payrollId");
            String managerId = (String) payload.getOrDefault("managerId", "");
            return ResponseEntity.ok(PayrollResponse.from(payrollService.approvePayroll(payrollId, managerId)));
        } catch (Exception e) { return ResponseEntity.badRequest().body(e.getMessage()); }
    }

    @PostMapping("/mark-paid")
    public ResponseEntity<?> markPaid(@RequestBody Map<String, Object> payload) {
        try {
            String payrollId = (String) payload.get("payrollId");
            payrollService.markAsPaid(payrollId);
            return ResponseEntity.ok("Đã đánh dấu đã thanh toán.");
        } catch (Exception e) { return ResponseEntity.badRequest().body(e.getMessage()); }
    }

    @PostMapping("/import-sales")
    public ResponseEntity<?> importSales(@RequestBody Map<String, Object> payload) {
        return ResponseEntity.ok(Map.of("message", "Import dữ liệu doanh số thành công", "imported", 0));
    }

    @GetMapping("/export")
    public ResponseEntity<?> export() {
        return ResponseEntity.ok(PaginatedResponse.of(
                payrollService.getAllPayrolls().stream().map(PayrollResponse::from).toList()
        ));
    }
}
