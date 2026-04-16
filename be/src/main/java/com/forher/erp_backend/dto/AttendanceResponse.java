package com.forher.erp_backend.dto;

import com.forher.erp_backend.entity.Attendance;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public record AttendanceResponse(
        Long attendanceId,
        String employeeId,
        String employeeName,
        LocalDate dateWork,
        LocalDateTime checkInTime,
        LocalDateTime checkOutTime,
        BigDecimal totalHours,
        String status,
        String note
) {
    public static AttendanceResponse from(Attendance a) {
        return new AttendanceResponse(
                a.getAttendanceId(),
                a.getEmployee() != null ? a.getEmployee().getEmployeeId() : null,
                a.getEmployee() != null ? a.getEmployee().getFullName() : null,
                a.getDateWork(),
                a.getCheckInTime(),
                a.getCheckOutTime(),
                a.getTotalHours(),
                a.getStatus(),
                a.getNote()
        );
    }
}
