package com.forher.erp_backend.service.Interface;
import com.forher.erp_backend.entity.Attendance;
import java.time.LocalDate;
import java.util.List;

public interface IAttendanceRequestService {
    // Nghiệp vụ: Quản lý duyệt/từ chối đơn xin sửa công
    void approveRequest(String requestId, String managerId);
    void rejectRequest(String requestId, String managerId);
}