package com.forher.erp_backend.controller;

import com.forher.erp_backend.dto.PayrollResponse;
import com.forher.erp_backend.entity.PayrollDeduction;
import com.forher.erp_backend.entity.SalesRecord;
import com.forher.erp_backend.service.Interface.IPayrollService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/hr/payroll")
@RequiredArgsConstructor
public class PayrollController {

    private final IPayrollService payrollService;

    // ── Danh sách bảng lương theo tháng ──────────────────────────────
    @GetMapping
    public ResponseEntity<?> getAll(
            @RequestParam String month,
            @RequestParam(required = false) String branchId) {
        return ResponseEntity.ok(
                payrollService.getPayrolls(month, branchId)
                        .stream().map(PayrollResponse::from).toList());
    }

    // ── Phiếu lương của nhân viên (tự xem) ───────────────────────────
    @GetMapping("/my")
    public ResponseEntity<?> getMy(@RequestParam String employeeId) {
        return ResponseEntity.ok(
                payrollService.getPayrollsByEmployee(employeeId)
                        .stream().map(PayrollResponse::from).toList());
    }

    // ── Chi tiết 1 bảng lương (payslip) ──────────────────────────────
    @GetMapping("/{id}")
    public ResponseEntity<?> getById(@PathVariable String id) {
        try { return ResponseEntity.ok(PayrollResponse.from(payrollService.getPayrollById(id))); }
        catch (RuntimeException e) { return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage()); }
    }

    // ── Tạo bảng lương cho 1 nhân viên ───────────────────────────────
    @PostMapping("/generate")
    public ResponseEntity<?> generate(@RequestBody Map<String, Object> body) {
        try {
            String employeeId = (String) body.get("employeeId");
            String month      = (String) body.get("month");
            String createdBy  = (String) body.getOrDefault("createdById", null);
            return ResponseEntity.status(HttpStatus.CREATED).body(
                    PayrollResponse.from(payrollService.generatePayroll(employeeId, month, createdBy)));
        } catch (Exception e) { return ResponseEntity.badRequest().body(e.getMessage()); }
    }

    // ── Tạo bảng lương hàng loạt cho toàn chi nhánh / toàn công ty ──
    @PostMapping("/generate-bulk")
    public ResponseEntity<?> generateBulk(@RequestBody Map<String, Object> body) {
        try {
            String month     = (String) body.get("month");
            String branchId  = (String) body.getOrDefault("branchId", null);
            String createdBy = (String) body.getOrDefault("createdById", null);
            List<PayrollResponse> result = payrollService.generateBulk(month, branchId, createdBy)
                    .stream().map(PayrollResponse::from).toList();
            return ResponseEntity.ok(Map.of("generated", result.size(), "data", result));
        } catch (Exception e) { return ResponseEntity.badRequest().body(e.getMessage()); }
    }

    // ── Cập nhật thủ công (OT, nghỉ phép, ABC, hệ số phụ cấp) ───────
    @PatchMapping("/{id}")
    public ResponseEntity<?> updateManual(@PathVariable String id,
                                          @RequestBody Map<String, Object> body) {
        try {
            Integer leaveDays      = body.get("leaveDays")      != null ? ((Number) body.get("leaveDays")).intValue()           : null;
            BigDecimal otHours     = body.get("otHours")        != null ? new BigDecimal(body.get("otHours").toString())        : null;
            BigDecimal otHoliday   = body.get("otHolidayHours") != null ? new BigDecimal(body.get("otHolidayHours").toString()) : null;
            BigDecimal allowRate   = body.get("allowanceRate")  != null ? new BigDecimal(body.get("allowanceRate").toString())  : null;
            String     abcRating   = (String) body.get("abcRating");
            String     note        = (String) body.get("note");
            return ResponseEntity.ok(PayrollResponse.from(
                    payrollService.updateManual(id, leaveDays, otHours, otHoliday, allowRate, abcRating, note)));
        } catch (Exception e) { return ResponseEntity.badRequest().body(e.getMessage()); }
    }

    // ── Chốt bảng lương ──────────────────────────────────────────────
    @PatchMapping("/{id}/finalize")
    public ResponseEntity<?> finalize(@PathVariable String id) {
        try { return ResponseEntity.ok(PayrollResponse.from(payrollService.finalizePayroll(id))); }
        catch (Exception e) { return ResponseEntity.badRequest().body(e.getMessage()); }
    }

    // ══════════════════════════════════════════════════════════════════
    // DOANH SỐ (Sales Import)
    // ══════════════════════════════════════════════════════════════════

    @GetMapping("/sales")
    public ResponseEntity<?> getSales(
            @RequestParam String month,
            @RequestParam(required = false) String branchId) {
        List<SalesRecord> records = payrollService.getSalesRecords(month, branchId);
        return ResponseEntity.ok(records.stream().map(s -> Map.of(
                "id",           s.getId(),
                "employeeId",   s.getEmployee().getEmployeeId(),
                "employeeName", s.getEmployee().getFullName(),
                "shiftDate",    s.getShiftDate().toString(),
                "shift",        s.getShift() != null ? s.getShift() : "",
                "salesAmount",  s.getSalesAmount() != null ? s.getSalesAmount() : BigDecimal.ZERO,
                "productCount", s.getProductCount()
        )).toList());
    }

    @PostMapping("/sales/import")
    public ResponseEntity<?> importSales(
            @RequestParam("file") MultipartFile file,
            @RequestParam String month,
            @RequestParam(required = false) String importedBy) {
        try {
            int count = payrollService.importSales(file, month, importedBy);
            return ResponseEntity.ok(Map.of("imported", count,
                    "message", "Import thành công " + count + " bản ghi doanh số"));
        } catch (Exception e) { return ResponseEntity.badRequest().body(e.getMessage()); }
    }

    // ══════════════════════════════════════════════════════════════════
    // KHẤU TRỪ (Tạm ứng / Phạt)
    // ══════════════════════════════════════════════════════════════════

    @GetMapping("/deductions")
    public ResponseEntity<?> getDeductions(
            @RequestParam String month,
            @RequestParam(required = false) String branchId) {
        List<PayrollDeduction> list = payrollService.getDeductions(month, branchId);
        return ResponseEntity.ok(list.stream().map(d -> Map.of(
                "id",           d.getId(),
                "employeeId",   d.getEmployee().getEmployeeId(),
                "employeeName", d.getEmployee().getFullName(),
                "type",         d.getType(),
                "amount",       d.getAmount(),
                "reason",       d.getReason() != null ? d.getReason() : "",
                "month",        d.getMonth(),
                "status",       d.getStatus()
        )).toList());
    }

    @PostMapping("/deductions")
    public ResponseEntity<?> addDeduction(@RequestBody Map<String, Object> body) {
        try {
            String     employeeId  = (String) body.get("employeeId");
            String     type        = (String) body.get("type");
            BigDecimal amount      = new BigDecimal(body.get("amount").toString());
            String     reason      = (String) body.get("reason");
            String     month       = (String) body.get("month");
            String     approvedBy  = (String) body.getOrDefault("approvedById", null);
            PayrollDeduction d = payrollService.addDeduction(employeeId, type, amount, reason, month, approvedBy);
            return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                    "id", d.getId(), "type", d.getType(), "amount", d.getAmount()));
        } catch (Exception e) { return ResponseEntity.badRequest().body(e.getMessage()); }
    }
}
