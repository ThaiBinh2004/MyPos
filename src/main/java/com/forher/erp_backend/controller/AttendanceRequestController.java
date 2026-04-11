package com.forher.erp_backend.controller;

import com.forher.erp_backend.service.Interface.IAttendanceRequestService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/attendance-requests")
@RequiredArgsConstructor
public class AttendanceRequestController {

    private final IAttendanceRequestService requestService;

    @PatchMapping("/{id}/approve")
    public ResponseEntity<?> approve(@PathVariable String id, @RequestParam String managerId) {
        try {
            requestService.approveRequest(id, managerId);
            return ResponseEntity.ok("Đã duyệt đơn sửa công.");
        } catch (Exception e) { return ResponseEntity.badRequest().body(e.getMessage()); }
    }

    @PatchMapping("/{id}/reject")
    public ResponseEntity<?> reject(@PathVariable String id, @RequestParam String managerId) {
        try {
            requestService.rejectRequest(id, managerId);
            return ResponseEntity.ok("Đã từ chối đơn sửa công.");
        } catch (Exception e) { return ResponseEntity.badRequest().body(e.getMessage()); }
    }
}