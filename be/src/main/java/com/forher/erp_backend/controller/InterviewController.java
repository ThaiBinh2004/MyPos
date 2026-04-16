package com.forher.erp_backend.controller;

import com.forher.erp_backend.dto.InterviewResponse;
import com.forher.erp_backend.service.Interface.IInterviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;

@RestController
@RequiredArgsConstructor
public class InterviewController {

    private final IInterviewService interviewService;

    @GetMapping("/api/v1/hr/interviews")
    public ResponseEntity<?> getInterviews(
            @RequestParam(required = false) String candidateId,
            @RequestParam(required = false) String employeeId) {
        if (candidateId != null)
            return ResponseEntity.ok(interviewService.getByCandidate(candidateId).stream()
                    .map(InterviewResponse::from).toList());
        if (employeeId != null)
            return ResponseEntity.ok(interviewService.getByInterviewer(employeeId).stream()
                    .map(InterviewResponse::from).toList());
        return ResponseEntity.badRequest().body("Cần truyền candidateId hoặc employeeId");
    }

    @PostMapping("/api/v1/hr/interviews")
    public ResponseEntity<?> schedule(@RequestBody Map<String, String> body) {
        try {
            return ResponseEntity.status(HttpStatus.CREATED).body(
                    InterviewResponse.from(interviewService.schedule(
                            body.get("candidateId"),
                            body.get("interviewerEmployeeId"),
                            LocalDateTime.parse(body.get("scheduledAt")),
                            body.getOrDefault("location", "")
                    ))
            );
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PatchMapping("/api/v1/hr/interviews/{id}/score")
    public ResponseEntity<?> submitScore(@PathVariable String id, @RequestBody Map<String, String> body) {
        try {
            interviewService.submitScore(id,
                    Integer.parseInt(body.get("score")),
                    body.getOrDefault("feedback", ""));
            return ResponseEntity.ok("Đã lưu đánh giá.");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PatchMapping("/api/v1/hr/interviews/{id}/cancel")
    public ResponseEntity<?> cancel(@PathVariable String id) {
        try {
            interviewService.cancel(id);
            return ResponseEntity.ok("Đã huỷ lịch phỏng vấn.");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/api/v1/interviews/confirm")
    public ResponseEntity<String> confirm(@RequestParam String token) {
        try {
            interviewService.confirmByToken(token);
            return ResponseEntity.ok(buildResponseHtml("✓ Xác nhận thành công!", "Cảm ơn bạn đã xác nhận tham dự. Chúng tôi sẽ liên hệ với bạn trước buổi phỏng vấn.", "#4f46e5"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(buildResponseHtml("Có lỗi xảy ra", e.getMessage(), "#ef4444"));
        }
    }

    @GetMapping("/api/v1/interviews/decline")
    public ResponseEntity<String> decline(@RequestParam String token) {
        try {
            interviewService.declineByToken(token);
            return ResponseEntity.ok(buildResponseHtml("Đã ghi nhận từ chối", "Cảm ơn bạn đã phản hồi. Chúc bạn may mắn trong tương lai!", "#6b7280"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(buildResponseHtml("Có lỗi xảy ra", e.getMessage(), "#ef4444"));
        }
    }

    private String buildResponseHtml(String title, String message, String color) {
        return """
            <!DOCTYPE html>
            <html lang="vi">
            <head><meta charset="UTF-8"><title>FORHER</title></head>
            <body style="font-family:Arial,sans-serif;display:flex;justify-content:center;align-items:center;min-height:100vh;margin:0;background:#f9fafb">
              <div style="text-align:center;padding:40px;background:white;border-radius:12px;box-shadow:0 4px 20px rgba(0,0,0,0.08);max-width:400px">
                <div style="font-size:48px;margin-bottom:16px">%s</div>
                <h2 style="color:%s;margin:0 0 12px">%s</h2>
                <p style="color:#6b7280">%s</p>
                <p style="margin-top:24px;font-size:12px;color:#9ca3af">FORHER</p>
              </div>
            </body>
            </html>
            """.formatted(color.equals("#4f46e5") ? "🎉" : color.equals("#6b7280") ? "👋" : "❌", color, title, message);
    }
}
