package com.forher.erp_backend.dto;

import com.forher.erp_backend.entity.AttendanceRequest;
import java.time.LocalDate;

public record AttendanceCorrectionResponse(
        String requestId,
        String employeeId,
        String employeeName,
        Long attendanceId,
        LocalDate requestDate,
        String status,
        String approvedBy
) {
    public static AttendanceCorrectionResponse from(AttendanceRequest r) {
        return new AttendanceCorrectionResponse(
                r.getRequestId(),
                r.getEmployee() != null ? r.getEmployee().getEmployeeId() : null,
                r.getEmployee() != null ? r.getEmployee().getFullName() : null,
                r.getAttendance() != null ? r.getAttendance().getAttendanceId() : null,
                r.getRequestDate(),
                r.getStatus(),
                r.getApprovedBy() != null ? r.getApprovedBy().getFullName() : null
        );
    }
}
