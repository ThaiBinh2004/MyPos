package com.forher.erp_backend.controller;

import com.forher.erp_backend.service.Interface.IRecruitmentRequestService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/recruitment-requests")
@RequiredArgsConstructor
public class RecruitmentRequestController {

    private final IRecruitmentRequestService requestService;

    // NGHIỆP VỤ: Phê duyệt yêu cầu tuyển dụng
    // CHỈ ADMIN (Giám đốc) mới có quyền duyệt để cấp ngân sách tuyển người
    @PreAuthorize("hasRole('ADMIN')")
    @PatchMapping("/{id}/approve")
    public ResponseEntity<?> approveRequest(@PathVariable String id) {
        try {
            requestService.approveRequest(id);
            return ResponseEntity.ok("Đã duyệt yêu cầu tuyển dụng!");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // NGHIỆP VỤ: Đóng yêu cầu tuyển dụng (Khi đã tuyển đủ hoặc hủy đợt tuyển)
    // ADMIN và MANAGER được phép đóng yêu cầu
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @PatchMapping("/{id}/close")
    public ResponseEntity<?> closeRequest(@PathVariable String id) {
        try {
            requestService.closeRequest(id);
            return ResponseEntity.ok("Đã đóng yêu cầu tuyển dụng.");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}