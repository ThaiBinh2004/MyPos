package com.forher.erp_backend.service;

import com.forher.erp_backend.entity.Attendance;
import com.forher.erp_backend.entity.Employee;
import com.forher.erp_backend.repository.AttendanceRepository;
import com.forher.erp_backend.repository.EmployeeRepository;
import com.forher.erp_backend.service.Interface.IAttendanceService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AttendanceService implements IAttendanceService {

    private final AttendanceRepository attendanceRepository;
    private final EmployeeRepository employeeRepository;

    @Override public List<Attendance> getAllAttendances() { return attendanceRepository.findAll(); }

    @Override public Attendance getAttendanceById(Long id) {
        return attendanceRepository.findById(id).orElseThrow(() -> new RuntimeException("Không tìm thấy chấm công!"));
    }

    @Override @Transactional
    public Attendance clockIn(String employeeId) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy Nhân viên!"));
        LocalDate today = LocalDate.now();
        boolean alreadyClockedIn = attendanceRepository.findAll().stream()
                .anyMatch(a -> a.getEmployee().getEmployeeId().equals(employeeId) && a.getDateWork().equals(today));
        if (alreadyClockedIn) throw new RuntimeException("Hôm nay bạn đã check-in rồi!");
        return attendanceRepository.save(Attendance.builder()
                .employee(employee).dateWork(today)
                .checkInTime(LocalDateTime.now()).status("PRESENT").build());
    }

    @Override @Transactional
    public Attendance clockOut(String attendanceId) {
        Attendance attendance = attendanceRepository.findById(Long.valueOf(attendanceId))
                .orElseThrow(() -> new RuntimeException("Không tìm thấy bản ghi chấm công!"));
        if (attendance.getCheckOutTime() != null) throw new RuntimeException("Đã check-out trước đó!");
        attendance.setCheckOutTime(LocalDateTime.now());
        if (attendance.getCheckInTime() != null) {
            double totalHours = Duration.between(attendance.getCheckInTime(), attendance.getCheckOutTime()).toMinutes() / 60.0;
            attendance.setTotalHours(BigDecimal.valueOf(totalHours).setScale(2, RoundingMode.HALF_UP));
        }
        return attendanceRepository.save(attendance);
    }

    @Override public List<Attendance> getMonthlyAttendance(String employeeId, int month, int year) {
        return attendanceRepository.findAll().stream()
                .filter(a -> a.getEmployee().getEmployeeId().equals(employeeId)
                        && a.getDateWork().getMonthValue() == month && a.getDateWork().getYear() == year)
                .collect(Collectors.toList());
    }
}
