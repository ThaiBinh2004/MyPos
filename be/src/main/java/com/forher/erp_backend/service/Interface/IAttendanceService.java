package com.forher.erp_backend.service.Interface;

import com.forher.erp_backend.dto.TodayAttendanceResponse;
import com.forher.erp_backend.entity.Attendance;

import java.time.LocalDate;
import java.util.List;

public interface IAttendanceService {
    List<Attendance> getFiltered(String branchId, String search, LocalDate dateFrom, LocalDate dateTo, String status);
    Attendance getAttendanceById(Long id);
    Attendance clockIn(String employeeId, String password);
    Attendance clockOut(String employeeId, String password);
    List<TodayAttendanceResponse> getTodayAttendance(String branchId);
}
