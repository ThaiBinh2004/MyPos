package com.forher.erp_backend.controller;

import com.forher.erp_backend.service.Interface.IPayslipService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/payslips")
@RequiredArgsConstructor
public class PayslipController {

    private final IPayslipService payslipService;

    // NGHIỆP VỤ: Xuất phiếu lương điện tử và gửi cho nhân viên
    // Chỉ Quản lý chi nhánh (MANAGER) hoặc Giám đốc (ADMIN) được quyền thực hiện
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @PostMapping("/generate/{payrollId}")
    public ResponseEntity<?> generatePayslip(@PathVariable String payrollId) {
        try {
            payslipService.generateAndSendPayslip(payrollId);
            return ResponseEntity.ok("Đã xuất phiếu lương và gửi cho nhân viên thành công!");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}