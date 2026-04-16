package com.forher.erp_backend.controller;

import com.forher.erp_backend.dto.AttendanceCorrectionResponse;
import com.forher.erp_backend.dto.AttendanceResponse;
import com.forher.erp_backend.dto.PaginatedResponse;
import com.forher.erp_backend.entity.AttendanceRequest;
import com.forher.erp_backend.service.Interface.IAttendanceRequestService;
import com.forher.erp_backend.service.Interface.IAttendanceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/hr/attendance")
@RequiredArgsConstructor
public class AttendanceController {

    private final IAttendanceService attendanceService;
    private final IAttendanceRequestService requestService;

    @GetMapping
    public ResponseEntity<?> getAll() {
        return ResponseEntity.ok(PaginatedResponse.of(
                attendanceService.getAllAttendances().stream().map(AttendanceResponse::from).toList()
        ));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getById(@PathVariable Long id) {
        try { return ResponseEntity.ok(AttendanceResponse.from(attendanceService.getAttendanceById(id))); }
        catch (RuntimeException e) { return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage()); }
    }

    @PostMapping("/checkin")
    public ResponseEntity<?> checkin(@RequestBody Map<String, String> payload) {
        try { return ResponseEntity.ok(AttendanceResponse.from(attendanceService.clockIn(payload.get("employeeId")))); }
        catch (RuntimeException e) { return ResponseEntity.badRequest().body(e.getMessage()); }
    }

    @PostMapping("/checkout")
    public ResponseEntity<?> checkout(@RequestBody Map<String, String> payload) {
        try { return ResponseEntity.ok(AttendanceResponse.from(attendanceService.clockOut(payload.get("attendanceId")))); }
        catch (RuntimeException e) { return ResponseEntity.badRequest().body(e.getMessage()); }
    }

    @GetMapping("/corrections")
    public ResponseEntity<?> getCorrections() {
        return ResponseEntity.ok(PaginatedResponse.of(
                requestService.getAllRequests().stream().map(AttendanceCorrectionResponse::from).toList()
        ));
    }

    @PostMapping("/corrections")
    public ResponseEntity<?> createCorrection(@RequestBody AttendanceRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(
                AttendanceCorrectionResponse.from(requestService.createRequest(request))
        );
    }

    @PatchMapping("/corrections/{id}/review")
    public ResponseEntity<?> reviewCorrection(@PathVariable String id, @RequestBody Map<String, String> payload) {
        try {
            String action = payload.getOrDefault("status", "");
            String managerId = payload.getOrDefault("managerId", "");
            if ("APPROVED".equalsIgnoreCase(action)) requestService.approveRequest(id, managerId);
            else requestService.rejectRequest(id, managerId);
            return ResponseEntity.ok("Đã xử lý đơn sửa công.");
        } catch (Exception e) { return ResponseEntity.badRequest().body(e.getMessage()); }
    }
}
