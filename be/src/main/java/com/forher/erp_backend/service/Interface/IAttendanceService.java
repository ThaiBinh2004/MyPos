package com.forher.erp_backend.service.Interface;
import com.forher.erp_backend.entity.Attendance;
import java.util.List;

public interface IAttendanceService {
    List<Attendance> getAllAttendances();
    Attendance getAttendanceById(Long id);
    Attendance clockIn(String employeeId);
    Attendance clockOut(String attendanceId);
    List<Attendance> getMonthlyAttendance(String employeeId, int month, int year);
}
