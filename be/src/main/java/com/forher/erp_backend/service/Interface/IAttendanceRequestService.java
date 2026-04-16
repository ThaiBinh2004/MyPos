package com.forher.erp_backend.service.Interface;
import com.forher.erp_backend.entity.AttendanceRequest;
import java.util.List;

public interface IAttendanceRequestService {
    List<AttendanceRequest> getAllRequests();
    AttendanceRequest createRequest(AttendanceRequest request);
    void approveRequest(String requestId, String managerId);
    void rejectRequest(String requestId, String managerId);
}
