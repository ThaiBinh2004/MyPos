package com.forher.erp_backend.controller;

import com.forher.erp_backend.service.Interface.IPayrollService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/payrolls")
@RequiredArgsConstructor
public class PayrollController {

    private final IPayrollService payrollService;

    // NGHIỆP VỤ: Tính lương cuối tháng cho 1 NV
    // Quản lý chi nhánh hoặc Giám đốc thực hiện
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @PostMapping("/calculate")
    public ResponseEntity<?> calculatePayroll(
            @RequestParam String employeeId,
            @RequestParam int month,
            @RequestParam int year) {
        try {
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(payrollService.calculateMonthlyPayroll(employeeId, month, year));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // NGHIỆP VỤ: Giám đốc duyệt bảng lương
    // CHỈ ADMIN (Giám đốc) mới có quyền phê duyệt dòng tiền
    @PreAuthorize("hasRole('ADMIN')")
    @PatchMapping("/{payrollId}/approve")
    public ResponseEntity<?> approvePayroll(
            @PathVariable String payrollId,
            @RequestParam String managerId) {
        try {
            return ResponseEntity.ok(payrollService.approvePayroll(payrollId, managerId));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}