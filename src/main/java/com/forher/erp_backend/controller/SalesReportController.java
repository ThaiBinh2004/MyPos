package com.forher.erp_backend.controller;

import com.forher.erp_backend.service.Interface.ISalesReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/reports")
@RequiredArgsConstructor
public class SalesReportController {

    private final ISalesReportService reportService;

    // 1. Chốt doanh thu Ngày
    @PostMapping("/daily")
    public ResponseEntity<?> generateDailyReport(@RequestParam String branchId, @RequestParam String date) {
        try {
            return ResponseEntity.ok(reportService.generateDailyReport(branchId, date));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    // 2. Chốt doanh thu Tháng
    @PostMapping("/monthly")
    public ResponseEntity<?> generateMonthlyReport(
            @RequestParam String branchId,
            @RequestParam int month,
            @RequestParam int year) {
        try {
            return ResponseEntity.ok(reportService.generateMonthlyReport(branchId, month, year));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }
}