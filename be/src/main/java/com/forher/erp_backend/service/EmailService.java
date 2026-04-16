package com.forher.erp_backend.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailService {

  private final JavaMailSender mailSender;
  private static final DateTimeFormatter FMT = DateTimeFormatter.ofPattern("HH:mm - dd/MM/yyyy");

  @Async
  public void sendInterviewInviteToCandidate(
      String toEmail, String candidateName,
      String position, LocalDateTime scheduledAt, String location, String token) {
    try {
      var msg = mailSender.createMimeMessage();
      var helper = new MimeMessageHelper(msg, true, "UTF-8");
      helper.setTo(toEmail);
      helper.setSubject("[FORHER] Thư mời phỏng vấn - " + position);
      helper.setText(buildCandidateEmail(candidateName, position, scheduledAt, location, token), true);
      mailSender.send(msg);
      log.info("Đã gửi thư mời PV tới ứng viên: {}", toEmail);
    } catch (Exception e) {
      log.error("Lỗi gửi email tới ứng viên {}: {}", toEmail, e.getMessage());
    }
  }

  @Async
  public void sendInterviewNotifyToInterviewer(
      String toEmail, String interviewerName,
      String candidateName, String position,
      LocalDateTime scheduledAt, String location) {
    try {
      var msg = mailSender.createMimeMessage();
      var helper = new MimeMessageHelper(msg, true, "UTF-8");
      helper.setTo(toEmail);
      helper.setSubject("[FORHER] Lịch phỏng vấn ứng viên - " + candidateName);
      helper.setText(buildInterviewerEmail(interviewerName, candidateName, position, scheduledAt, location), true);
      mailSender.send(msg);
      log.info("Đã gửi thông báo PV tới người phỏng vấn: {}", toEmail);
    } catch (Exception e) {
      log.error("Lỗi gửi email tới người phỏng vấn {}: {}", toEmail, e.getMessage());
    }
  }

  @Async
  public void sendOfferLetter(String toEmail, String candidateName, String position, String salary, String token) {
    try {
      var msg = mailSender.createMimeMessage();
      var helper = new MimeMessageHelper(msg, true, "UTF-8");
      helper.setTo(toEmail);
      helper.setSubject("[FORHER] Thư mời nhận việc - " + position);
      helper.setText(buildOfferEmail(candidateName, position, salary, token), true);
      mailSender.send(msg);
      log.info("Đã gửi thư mời nhận việc tới: {}", toEmail);
    } catch (Exception e) {
      log.error("Lỗi gửi thư mời nhận việc tới {}: {}", toEmail, e.getMessage());
    }
  }

  private String buildOfferEmail(String name, String position, String salary, String token) {
    String baseUrl = "http://localhost:8080";
    String acceptUrl = baseUrl + "/api/v1/offers/accept?token=" + token;
    String declineUrl = baseUrl + "/api/v1/offers/decline?token=" + token;
    String salaryRow = (salary != null && !salary.isBlank())
        ? """
            <tr>
              <td style="padding:10px 16px;border-bottom:1px solid #f3f4f6;color:#6b7280;font-size:14px;width:40%%">Mức lương</td>
              <td style="padding:10px 16px;border-bottom:1px solid #f3f4f6;font-size:14px;font-weight:600;color:#4f46e5">%s</td>
            </tr>"""
            .formatted(formatSalary(salary))
        : "";
    return """
        <!DOCTYPE html>
        <html><head><meta charset="UTF-8"></head>
        <body style="margin:0;padding:0;background-color:#f3f4f6;font-family:'Segoe UI',Arial,sans-serif">
          <table width="100%%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:40px 0">
            <tr><td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08)">

                <!-- Header -->
                <tr>
                  <td style="background:linear-gradient(135deg,#4f46e5 0%%,#7c3aed 100%%);padding:32px 40px;text-align:center">
                    <h1 style="margin:0;color:#ffffff;font-size:26px;font-weight:700;letter-spacing:1px">FORHER</h1>
                    <p style="margin:6px 0 0;color:#c7d2fe;font-size:13px;letter-spacing:2px;text-transform:uppercase">Thư mời nhận việc</p>
                  </td>
                </tr>

                <!-- Body -->
                <tr>
                  <td style="padding:36px 40px">
                    <p style="margin:0 0 8px;color:#374151;font-size:15px">Kính gửi <strong>%s</strong>,</p>
                    <p style="margin:0 0 24px;color:#6b7280;font-size:14px;line-height:1.6">
                      Sau quá trình tuyển chọn kỹ lưỡng, Ban Giám đốc công ty <strong style="color:#374151">FORHER</strong>
                      vui mừng thông báo bạn đã chính thức được chọn để tham gia đội ngũ của chúng tôi.
                    </p>

                    <!-- Info table -->
                    <table width="100%%" cellpadding="0" cellspacing="0" style="border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;margin-bottom:28px">
                      <tr style="background:#f9fafb">
                        <td colspan="2" style="padding:10px 16px;font-size:12px;font-weight:600;color:#9ca3af;text-transform:uppercase;letter-spacing:1px;border-bottom:1px solid #e5e7eb">
                          Chi tiết lời mời
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:10px 16px;border-bottom:1px solid #f3f4f6;color:#6b7280;font-size:14px;width:40%%">Vị trí</td>
                        <td style="padding:10px 16px;border-bottom:1px solid #f3f4f6;font-size:14px;font-weight:600;color:#111827">%s</td>
                      </tr>
                      %s
                    </table>

                    <p style="margin:0 0 20px;color:#374151;font-size:14px">Vui lòng xác nhận quyết định của bạn:</p>

                    <!-- CTA buttons -->
                    <table cellpadding="0" cellspacing="0" style="margin-bottom:28px">
                      <tr>
                        <td style="padding-right:12px">
                          <a href="%s" style="display:inline-block;background:#4f46e5;color:#ffffff;padding:13px 28px;border-radius:8px;text-decoration:none;font-size:14px;font-weight:600">
                            ✅ &nbsp;Chấp nhận lời mời
                          </a>
                        </td>
                        <td>
                          <a href="%s" style="display:inline-block;background:#ffffff;color:#6b7280;padding:12px 28px;border-radius:8px;text-decoration:none;font-size:14px;font-weight:600;border:1px solid #d1d5db">
                            Từ chối
                          </a>
                        </td>
                      </tr>
                    </table>

                    <p style="margin:0;color:#9ca3af;font-size:13px;line-height:1.5">
                      Nếu có bất kỳ thắc mắc nào, vui lòng liên hệ phòng Nhân sự để được hỗ trợ.
                    </p>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="background:#f9fafb;padding:20px 40px;border-top:1px solid #e5e7eb">
                    <p style="margin:0;color:#374151;font-size:13px;font-weight:600">Phòng Nhân sự — FORHER</p>
                    <p style="margin:4px 0 0;color:#9ca3af;font-size:12px">Email này được gửi tự động, vui lòng không trả lời trực tiếp.</p>
                  </td>
                </tr>

              </table>
            </td></tr>
          </table>
        </body></html>
        """
        .formatted(name, position, salaryRow, acceptUrl, declineUrl);
  }

  private String formatSalary(String salary) {
    try {
      long amount = Long.parseLong(salary.replaceAll("[^0-9]", ""));
      return String.format("%,d VNĐ", amount).replace(",", ".");
    } catch (NumberFormatException e) {
      return salary;
    }
  }

  private String buildCandidateEmail(String name, String position, LocalDateTime at, String location, String token) {
    return """
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:24px;border:1px solid #e5e7eb;border-radius:8px">
          <h2 style="color:#4f46e5">FORHER</h2>
          <p>Kính gửi <strong>%s</strong>,</p>
          <p>Chúng tôi vui mừng thông báo bạn đã được mời tham gia phỏng vấn cho vị trí <strong>%s</strong>.</p>
          <table style="background:#f9fafb;padding:16px;border-radius:8px;width:100%%">
            <tr><td style="padding:4px 0;color:#6b7280">Thời gian</td><td><strong>%s</strong></td></tr>
            <tr><td style="padding:4px 0;color:#6b7280">Địa điểm</td><td><strong>%s</strong></td></tr>
          </table>
          <p style="margin-top:16px">Vui lòng <strong>trả lời email này</strong> để xác nhận tham dự hoặc đề xuất thay đổi lịch nếu bạn không thể tham gia vào thời điểm trên.</p>
          <p>Trân trọng,<br><strong>Phòng Nhân sự - FORHER</strong></p>
        </div>
        """
        .formatted(name, position, at.format(FMT), location);
  }

  private String buildInterviewerEmail(String interviewer, String candidate, String position, LocalDateTime at,
      String location) {
    return """
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:24px;border:1px solid #e5e7eb;border-radius:8px">
          <h2 style="color:#4f46e5">FORHER</h2>
          <p>Kính gửi <strong>%s</strong>,</p>
          <p>Bạn có lịch phỏng vấn ứng viên cho vị trí <strong>%s</strong>.</p>
          <table style="background:#f9fafb;padding:16px;border-radius:8px;width:100%%">
            <tr><td style="padding:4px 0;color:#6b7280">Ứng viên</td><td><strong>%s</strong></td></tr>
            <tr><td style="padding:4px 0;color:#6b7280">Thời gian</td><td><strong>%s</strong></td></tr>
            <tr><td style="padding:4px 0;color:#6b7280">Địa điểm</td><td><strong>%s</strong></td></tr>
          </table>
          <p style="margin-top:16px">Sau buổi phỏng vấn, vui lòng nhập đánh giá trên hệ thống FORHER ERP.</p>
          <p>Trân trọng,<br><strong>Phòng Nhân sự - FORHER</strong></p>
        </div>
        """
        .formatted(interviewer, position, candidate, at.format(FMT), location);
  }
}
