package com.forher.erp_backend.service.Interface;
import com.forher.erp_backend.entity.Attendance;
import java.time.LocalDate;
import java.util.List;

public interface IAttendanceService {
    // Nghiệp vụ cốt lõi: Check-in và Check-out
    Attendance clockIn(String employeeId);
    Attendance clockOut(String attendanceId);

    // Nghiệp vụ: Lấy lịch sử chấm công của NV trong 1 tháng
    List<Attendance> getMonthlyAttendance(String employeeId, int month, int year);
}