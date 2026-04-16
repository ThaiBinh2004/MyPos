package com.forher.erp_backend.service;

import com.forher.erp_backend.entity.Attendance;
import com.forher.erp_backend.repository.AttendanceRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

/**
 * Tự động gắn cờ MISSING_CHECKOUT cho nhân viên quên check-out.
 * Chạy 30 phút sau khi mỗi ca kết thúc:
 *   - CA_SANG  kết thúc 15:00 → chạy lúc 15:30
 *   - HANH_CHINH kết thúc 18:00 → chạy lúc 18:30
 *   - CA_TOI   kết thúc 23:00 → chạy lúc 23:30
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class AttendanceScheduler {

    private final AttendanceRepository attendanceRepository;

    // Sau ca sáng (7:00–15:00) → chạy 15:30
    @Scheduled(cron = "0 30 15 * * *")
    @Transactional
    public void flagMissingCheckoutAfterMorningShift() {
        flagMissingCheckout("CA_SANG", LocalTime.of(15, 0));
    }

    // Sau giờ hành chính (9:00–18:00) → chạy 18:30
    @Scheduled(cron = "0 30 18 * * *")
    @Transactional
    public void flagMissingCheckoutAfterOfficeHours() {
        flagMissingCheckout("HANH_CHINH", LocalTime.of(18, 0));
    }

    // Sau ca tối (15:00–23:00) → chạy 23:30
    @Scheduled(cron = "0 30 23 * * *")
    @Transactional
    public void flagMissingCheckoutAfterEveningShift() {
        flagMissingCheckout("CA_TOI", LocalTime.of(23, 0));
    }

    private void flagMissingCheckout(String shiftType, LocalTime shiftEnd) {
        LocalDate today = LocalDate.now();
        List<Attendance> unclosed = attendanceRepository.findCheckedInWithoutCheckout(today);

        int count = 0;
        for (Attendance att : unclosed) {
            String empShift = att.getEmployee().getDefaultShift();
            // Chỉ xử lý đúng ca, hoặc null shift thì áp dụng theo giờ thực tế
            if (shiftType.equals(empShift) || (empShift == null && LocalTime.now().isAfter(shiftEnd))) {
                att.setStatus("MISSING_CHECKOUT");
                att.setNote("Quên check-out sau ca " + shiftType);
                attendanceRepository.save(att);
                count++;
            }
        }

        if (count > 0) {
            log.info("[AttendanceScheduler] Đã gắn cờ MISSING_CHECKOUT cho {} bản ghi ca {}", count, shiftType);
        }
    }
}
