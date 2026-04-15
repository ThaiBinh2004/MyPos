package com.forher.erp_backend.controller;

import com.forher.erp_backend.service.Interface.IAttendanceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/attendances")
@RequiredArgsConstructor
public class AttendanceController {

    private final IAttendanceService attendanceService;

    // NGHIỆP VỤ: Điểm danh vào ca (Check-in)
    // TẤT CẢ mọi người (Nhân viên, Quản lý, Giám đốc) đều được quyền tự Check-in
    @PreAuthorize("hasAnyRole('EMPLOYEE', 'MANAGER', 'ADMIN')")
    @PostMapping("/clock-in/{employeeId}")
    public ResponseEntity<?> clockIn(@PathVariable String employeeId) {
        try { return ResponseEntity.ok(attendanceService.clockIn(employeeId)); }
        catch (Exception e) { return ResponseEntity.badRequest().body(e.getMessage()); }
    }

    // NGHIỆP VỤ: Điểm danh tan ca (Check-out)
    // TẤT CẢ mọi người đều được quyền tự Check-out
    @PreAuthorize("hasAnyRole('EMPLOYEE', 'MANAGER', 'ADMIN')")
    @PatchMapping("/clock-out/{attendanceId}")
    public ResponseEntity<?> clockOut(@PathVariable String attendanceId) {
        try { return ResponseEntity.ok(attendanceService.clockOut(attendanceId)); }
        catch (Exception e) { return ResponseEntity.badRequest().body(e.getMessage()); }
    }

    // NGHIỆP VỤ: Xem lịch sử chấm công trong tháng
    // - Nhân viên: Được xem của chính mình (Logic check ID sẽ nằm ở Service).
    // - Quản lý/Giám đốc: Được xem của tất cả mọi người.
    @PreAuthorize("hasAnyRole('EMPLOYEE', 'MANAGER', 'ADMIN')")
    @GetMapping("/monthly/{employeeId}")
    public ResponseEntity<?> getMonthlyAttendance(@PathVariable String employeeId, @RequestParam int month, @RequestParam int year) {
        return ResponseEntity.ok(attendanceService.getMonthlyAttendance(employeeId, month, year));
    }
}