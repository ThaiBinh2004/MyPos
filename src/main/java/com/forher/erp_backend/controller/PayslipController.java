package com.forher.erp_backend.controller;

import com.forher.erp_backend.service.Interface.IPayslipService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/payslips")
@RequiredArgsConstructor
public class PayslipController {

    private final IPayslipService payslipService;

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