package com.forher.erp_backend.dto;

import java.time.LocalDateTime;

public record TodayAttendanceResponse(
        String employeeId,
        String employeeName,
        String position,
        String defaultShift,
        Long attendanceId,
        LocalDateTime checkInTime,
        LocalDateTime checkOutTime,
        String status   // NOT_IN, ON_TIME, LATE, EARLY_LEAVE, DONE
) {}
