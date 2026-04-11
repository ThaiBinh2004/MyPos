package com.forher.erp_backend.controller;

import com.forher.erp_backend.service.Interface.ICandidateService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/candidates")
@RequiredArgsConstructor
public class CandidateController {

    private final ICandidateService candidateService;

    // NGHIỆP VỤ: Lên lịch phỏng vấn
    @PatchMapping("/{id}/schedule")
    public ResponseEntity<?> scheduleInterview(@PathVariable String id, @RequestParam String date) {
        try {
            candidateService.scheduleInterview(id, date);
            return ResponseEntity.ok("Đã lên lịch phỏng vấn vào: " + date);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // NGHIỆP VỤ: Nhận ứng viên
    @PatchMapping("/{id}/accept")
    public ResponseEntity<?> acceptCandidate(@PathVariable String id) {
        try {
            candidateService.acceptCandidate(id);
            return ResponseEntity.ok("Đã nhận ứng viên vào làm!");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // NGHIỆP VỤ: Đánh trượt ứng viên
    @PatchMapping("/{id}/reject")
    public ResponseEntity<?> rejectCandidate(@PathVariable String id) {
        try {
            candidateService.rejectCandidate(id);
            return ResponseEntity.ok("Đã từ chối ứng viên.");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}