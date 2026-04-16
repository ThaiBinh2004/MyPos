package com.forher.erp_backend.controller;

import com.forher.erp_backend.dto.AttendanceCorrectionResponse;
import com.forher.erp_backend.dto.AttendanceResponse;
import com.forher.erp_backend.service.Interface.IAttendanceRequestService;
import com.forher.erp_backend.service.Interface.IAttendanceService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/hr/attendance")
@RequiredArgsConstructor
public class AttendanceController {

    private final IAttendanceService attendanceService;
    private final IAttendanceRequestService requestService;

    // Danh sách có lọc (manager/director dùng)
    @GetMapping
    public ResponseEntity<?> getAll(
            @RequestParam(required = false) String branchId,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateFrom,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateTo,
            @RequestParam(required = false) String status
    ) {
        return ResponseEntity.ok(
                attendanceService.getFiltered(branchId, search, dateFrom, dateTo, status)
                        .stream().map(AttendanceResponse::from).toList()
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getById(@PathVariable Long id) {
        try { return ResponseEntity.ok(AttendanceResponse.from(attendanceService.getAttendanceById(id))); }
        catch (RuntimeException e) { return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage()); }
    }

    // Kiosk: danh sách nhân viên hôm nay (public — không cần JWT)
    @GetMapping("/today")
    public ResponseEntity<?> getToday(@RequestParam(required = false) String branchId) {
        return ResponseEntity.ok(attendanceService.getTodayAttendance(branchId));
    }

    // Kiosk: check-in (public — xác thực bằng mật khẩu nội bộ)
    @PostMapping("/checkin")
    public ResponseEntity<?> checkin(@RequestBody Map<String, String> payload) {
        try {
            String employeeId = payload.get("employeeId");
            String password   = payload.get("password");
            return ResponseEntity.ok(AttendanceResponse.from(attendanceService.clockIn(employeeId, password)));
        } catch (RuntimeException e) { return ResponseEntity.badRequest().body(e.getMessage()); }
    }

    // Kiosk: check-out (public — xác thực bằng mật khẩu nội bộ)
    @PostMapping("/checkout")
    public ResponseEntity<?> checkout(@RequestBody Map<String, String> payload) {
        try {
            String employeeId = payload.get("employeeId");
            String password   = payload.get("password");
            return ResponseEntity.ok(AttendanceResponse.from(attendanceService.clockOut(employeeId, password)));
        } catch (RuntimeException e) { return ResponseEntity.badRequest().body(e.getMessage()); }
    }

    // Danh sách đơn sửa công (manager/director)
    @GetMapping("/corrections")
    public ResponseEntity<?> getCorrections(
            @RequestParam(required = false) String branchId,
            @RequestParam(required = false) String status
    ) {
        return ResponseEntity.ok(
                requestService.getFiltered(branchId, status)
                        .stream().map(AttendanceCorrectionResponse::from).toList()
        );
    }

    // Đơn sửa công của nhân viên cụ thể
    @GetMapping("/corrections/my")
    public ResponseEntity<?> getMyCorrections(@RequestParam String employeeId) {
        return ResponseEntity.ok(
                requestService.getByEmployee(employeeId)
                        .stream().map(AttendanceCorrectionResponse::from).toList()
        );
    }

    // Nhân viên gửi đơn sửa công
    @PostMapping("/corrections")
    public ResponseEntity<?> createCorrection(@RequestBody Map<String, Object> body) {
        try {
            String employeeId = body.get("employeeId") != null ? body.get("employeeId").toString() : null;
            Long attendanceId = body.get("attendanceId") != null
                    ? Long.valueOf(body.get("attendanceId").toString()) : null;
            String reason     = body.get("reason") != null ? body.get("reason").toString() : null;
            LocalDateTime reqIn  = body.get("requestedCheckIn")  != null
                    ? LocalDateTime.parse(body.get("requestedCheckIn").toString())  : null;
            LocalDateTime reqOut = body.get("requestedCheckOut") != null
                    ? LocalDateTime.parse(body.get("requestedCheckOut").toString()) : null;

            if (employeeId == null || reason == null || reason.isBlank())
                return ResponseEntity.badRequest().body("Thiếu thông tin bắt buộc!");

            return ResponseEntity.status(HttpStatus.CREATED).body(
                    AttendanceCorrectionResponse.from(
                            requestService.createRequest(employeeId, attendanceId, reqIn, reqOut, reason)
                    )
            );
        } catch (Exception e) { return ResponseEntity.badRequest().body(e.getMessage()); }
    }

    // Manager duyệt/từ chối đơn sửa công
    @PatchMapping("/corrections/{id}/review")
    public ResponseEntity<?> reviewCorrection(
            @PathVariable String id,
            @RequestBody Map<String, String> payload
    ) {
        try {
            String action     = payload.getOrDefault("status", "");
            String managerId  = payload.getOrDefault("managerId", "");
            String reviewNote = payload.getOrDefault("reviewNote", null);

            if ("APPROVED".equalsIgnoreCase(action)) requestService.approveRequest(id, managerId, reviewNote);
            else requestService.rejectRequest(id, managerId, reviewNote);

            return ResponseEntity.ok("Đã xử lý đơn sửa công.");
        } catch (Exception e) { return ResponseEntity.badRequest().body(e.getMessage()); }
    }
}
