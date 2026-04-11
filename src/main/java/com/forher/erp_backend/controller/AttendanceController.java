package com.forher.erp_backend.controller;

import com.forher.erp_backend.service.Interface.IAttendanceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/attendances")
@RequiredArgsConstructor
public class AttendanceController {

    private final IAttendanceService attendanceService;

    @PostMapping("/clock-in/{employeeId}")
    public ResponseEntity<?> clockIn(@PathVariable String employeeId) {
        try { return ResponseEntity.ok(attendanceService.clockIn(employeeId)); }
        catch (Exception e) { return ResponseEntity.badRequest().body(e.getMessage()); }
    }

    @PatchMapping("/clock-out/{attendanceId}")
    public ResponseEntity<?> clockOut(@PathVariable String attendanceId) {
        try { return ResponseEntity.ok(attendanceService.clockOut(attendanceId)); }
        catch (Exception e) { return ResponseEntity.badRequest().body(e.getMessage()); }
    }

    @GetMapping("/monthly/{employeeId}")
    public ResponseEntity<?> getMonthlyAttendance(@PathVariable String employeeId, @RequestParam int month, @RequestParam int year) {
        return ResponseEntity.ok(attendanceService.getMonthlyAttendance(employeeId, month, year));
    }
}