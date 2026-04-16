package com.forher.erp_backend.controller;

import com.forher.erp_backend.service.Interface.ISalesReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/sales/reports")
@RequiredArgsConstructor
public class SalesReportController {

    private final ISalesReportService reportService;

    @GetMapping
    public ResponseEntity<?> getAll() {
        return ResponseEntity.ok(reportService.getAllReports());
    }
}
