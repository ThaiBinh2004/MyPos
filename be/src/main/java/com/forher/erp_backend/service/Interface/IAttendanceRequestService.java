package com.forher.erp_backend.service.Interface;

import com.forher.erp_backend.entity.AttendanceRequest;

import java.time.LocalDateTime;
import java.util.List;

public interface IAttendanceRequestService {
    List<AttendanceRequest> getFiltered(String branchId, String status);
    List<AttendanceRequest> getByEmployee(String employeeId);
    AttendanceRequest createRequest(String employeeId, Long attendanceId,
                                    LocalDateTime requestedCheckIn, LocalDateTime requestedCheckOut,
                                    String reason);
    void approveRequest(String requestId, String managerId, String reviewNote);
    void rejectRequest(String requestId, String managerId, String reviewNote);
}
