package com.forher.erp_backend.controller;

import com.forher.erp_backend.dto.CandidateResponse;
import com.forher.erp_backend.dto.PaginatedResponse;
import com.forher.erp_backend.dto.RecruitmentRequestResponse;
import com.forher.erp_backend.entity.Candidate;
import com.forher.erp_backend.entity.RecruitmentRequest;
import com.forher.erp_backend.service.Interface.ICandidateService;
import com.forher.erp_backend.service.Interface.IRecruitmentRequestService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequiredArgsConstructor
public class RecruitmentRequestController {

    private final IRecruitmentRequestService recruitmentService;
    private final ICandidateService candidateService;

    @GetMapping("/api/v1/hr/recruitment")
    public ResponseEntity<?> getAllRecruitment() {
        return ResponseEntity.ok(PaginatedResponse.of(
                recruitmentService.getAllRequests().stream().map(RecruitmentRequestResponse::from).toList()
        ));
    }

    @GetMapping("/api/v1/hr/recruitment/{id}")
    public ResponseEntity<?> getRecruitmentById(@PathVariable String id) {
        try { return ResponseEntity.ok(RecruitmentRequestResponse.from(recruitmentService.getRequestById(id))); }
        catch (RuntimeException e) { return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage()); }
    }

    @PostMapping("/api/v1/hr/recruitment")
    public ResponseEntity<?> createRecruitment(@RequestBody RecruitmentRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(
                RecruitmentRequestResponse.from(recruitmentService.createRequest(request))
        );
    }

    @PostMapping("/api/v1/hr/recruitment/{id}/close")
    public ResponseEntity<?> closeRecruitment(@PathVariable String id) {
        try { recruitmentService.closeRequest(id); return ResponseEntity.ok("Đã đóng yêu cầu tuyển dụng."); }
        catch (Exception e) { return ResponseEntity.badRequest().body(e.getMessage()); }
    }

    @GetMapping("/api/v1/hr/candidates")
    public ResponseEntity<?> getAllCandidates() {
        return ResponseEntity.ok(PaginatedResponse.of(
                candidateService.getAllCandidates().stream().map(CandidateResponse::from).toList()
        ));
    }

    @GetMapping("/api/v1/hr/candidates/{id}")
    public ResponseEntity<?> getCandidateById(@PathVariable String id) {
        try { return ResponseEntity.ok(CandidateResponse.from(candidateService.getCandidateById(id))); }
        catch (RuntimeException e) { return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage()); }
    }

    @PostMapping("/api/v1/hr/candidates")
    public ResponseEntity<?> createCandidate(@RequestBody Candidate candidate) {
        return ResponseEntity.status(HttpStatus.CREATED).body(
                CandidateResponse.from(candidateService.createCandidate(candidate))
        );
    }

    @PatchMapping("/api/v1/hr/candidates/{id}/status")
    public ResponseEntity<?> updateCandidateStatus(@PathVariable String id, @RequestBody Map<String, String> payload) {
        try { candidateService.updateCandidateStatus(id, payload.get("status")); return ResponseEntity.ok("Đã cập nhật trạng thái."); }
        catch (Exception e) { return ResponseEntity.badRequest().body(e.getMessage()); }
    }

    // ─── Offer Letter ────────────────────────────────────────────────────────

    @PostMapping("/api/v1/hr/candidates/{id}/send-offer")
    public ResponseEntity<?> sendOffer(@PathVariable String id, @RequestBody Map<String, String> payload) {
        try {
            candidateService.sendOffer(id, payload.get("branchId"), payload.get("salary"));
            return ResponseEntity.ok("Đã gửi thư mời nhận việc.");
        } catch (Exception e) { return ResponseEntity.badRequest().body(e.getMessage()); }
    }

    @GetMapping("/api/v1/offers/accept")
    public ResponseEntity<String> showAcceptForm(@RequestParam String token) {
        return ResponseEntity.ok()
                .header("Content-Type", "text/html;charset=UTF-8")
                .body(buildAcceptForm(token));
    }

    @PostMapping("/api/v1/offers/accept")
    public ResponseEntity<String> processAccept(
            @RequestParam String token,
            @RequestParam String dateOfBirth,
            @RequestParam String idCard,
            @RequestParam String bankAccount) {
        try {
            candidateService.acceptOffer(token, dateOfBirth, idCard, bankAccount);
            return ResponseEntity.ok()
                    .header("Content-Type", "text/html;charset=UTF-8")
                    .body(buildResultPage("✅", "#4f46e5", "Chúc mừng!",
                            "Bạn đã chấp nhận lời mời làm việc. Phòng Nhân sự sẽ liên hệ với bạn sớm nhất."));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .header("Content-Type", "text/html;charset=UTF-8")
                    .body(buildResultPage("❌", "#dc2626", "Đã xảy ra lỗi", e.getMessage()));
        }
    }

    @GetMapping("/api/v1/offers/decline")
    public ResponseEntity<String> processDecline(@RequestParam String token) {
        try {
            candidateService.declineOffer(token);
            return ResponseEntity.ok()
                    .header("Content-Type", "text/html;charset=UTF-8")
                    .body(buildResultPage("👋", "#6b7280", "Đã ghi nhận",
                            "Bạn đã từ chối lời mời. Cảm ơn bạn đã dành thời gian tham gia quá trình tuyển dụng của FORHER."));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .header("Content-Type", "text/html;charset=UTF-8")
                    .body(buildResultPage("❌", "#dc2626", "Đã xảy ra lỗi", e.getMessage()));
        }
    }

    private String buildAcceptForm(String token) {
        return """
            <!DOCTYPE html>
            <html><head><meta charset="UTF-8">
            <title>Xác nhận nhận việc - FORHER</title>
            <style>
              body{font-family:'Segoe UI',Arial,sans-serif;background:#f3f4f6;margin:0;padding:40px 16px}
              .card{max-width:480px;margin:auto;background:#fff;border-radius:12px;padding:40px;box-shadow:0 2px 8px rgba(0,0,0,.08)}
              h2{margin:0 0 4px;color:#4f46e5;font-size:22px}
              p{color:#6b7280;font-size:14px;margin:0 0 24px}
              label{display:block;font-size:13px;color:#374151;font-weight:600;margin-bottom:6px}
              input{width:100%%;padding:10px 12px;border:1px solid #d1d5db;border-radius:8px;font-size:14px;box-sizing:border-box;margin-bottom:16px}
              button{width:100%%;background:#4f46e5;color:#fff;border:none;padding:13px;border-radius:8px;font-size:15px;font-weight:600;cursor:pointer}
            </style></head>
            <body>
              <div class="card">
                <h2>FORHER</h2>
                <p>Vui lòng điền thông tin để hoàn tất hồ sơ nhận việc</p>
                <form method="post" action="/api/v1/offers/accept?token=%s">
                  <label>Ngày sinh</label>
                  <input type="date" name="dateOfBirth" required>
                  <label>CMND / CCCD</label>
                  <input type="text" name="idCard" placeholder="Số CMND hoặc CCCD" required>
                  <label>Số tài khoản ngân hàng</label>
                  <input type="text" name="bankAccount" placeholder="Số tài khoản" required>
                  <button type="submit">Xác nhận nhận việc</button>
                </form>
              </div>
            </body></html>
            """.formatted(token);
    }

    private String buildResultPage(String icon, String color, String title, String message) {
        return """
            <!DOCTYPE html>
            <html><head><meta charset="UTF-8"><title>FORHER</title>
            <style>
              body{font-family:'Segoe UI',Arial,sans-serif;background:#f3f4f6;margin:0;display:flex;align-items:center;justify-content:center;min-height:100vh}
              .card{background:#fff;border-radius:12px;padding:48px 40px;text-align:center;box-shadow:0 2px 8px rgba(0,0,0,.08);max-width:440px}
              .icon{font-size:48px;margin-bottom:16px}
              h2{color:%s;margin:0 0 12px}
              p{color:#6b7280;font-size:14px;line-height:1.6;margin:0}
              .brand{margin-top:24px;font-size:12px;color:#9ca3af}
            </style></head>
            <body><div class="card">
              <div class="icon">%s</div>
              <h2>%s</h2>
              <p>%s</p>
              <p class="brand">FORHER</p>
            </div></body></html>
            """.formatted(color, icon, title, message);
    }
}
