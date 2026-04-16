package com.forher.erp_backend.dto;

import com.forher.erp_backend.entity.AttendanceRequest;
import java.time.LocalDate;
import java.time.LocalDateTime;

public record AttendanceCorrectionResponse(
        String requestId,
        String employeeId,
        String employeeName,
        String branchId,
        Long attendanceId,
        LocalDateTime requestedCheckIn,
        LocalDateTime requestedCheckOut,
        String reason,
        LocalDate requestDate,
        String status,
        String approvedByName,
        String reviewNote
) {
    public static AttendanceCorrectionResponse from(AttendanceRequest r) {
        return new AttendanceCorrectionResponse(
                r.getRequestId(),
                r.getEmployee() != null ? r.getEmployee().getEmployeeId() : null,
                r.getEmployee() != null ? r.getEmployee().getFullName() : null,
                r.getEmployee() != null && r.getEmployee().getBranch() != null
                        ? r.getEmployee().getBranch().getBranchId() : null,
                r.getAttendance() != null ? r.getAttendance().getAttendanceId() : null,
                r.getRequestedCheckIn(),
                r.getRequestedCheckOut(),
                r.getReason(),
                r.getRequestDate(),
                r.getStatus(),
                r.getApprovedBy() != null ? r.getApprovedBy().getFullName() : null,
                r.getReviewNote()
        );
    }
}
