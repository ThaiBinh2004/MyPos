package com.forher.erp_backend.service;

import com.forher.erp_backend.dto.TodayAttendanceResponse;
import com.forher.erp_backend.entity.Attendance;
import com.forher.erp_backend.entity.Employee;
import com.forher.erp_backend.entity.UserAccount;
import com.forher.erp_backend.repository.AttendanceRepository;
import com.forher.erp_backend.repository.EmployeeRepository;
import com.forher.erp_backend.repository.UserAccountRepository;
import com.forher.erp_backend.service.Interface.IAttendanceService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.*;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AttendanceService implements IAttendanceService {

    private final AttendanceRepository attendanceRepository;
    private final EmployeeRepository employeeRepository;
    private final UserAccountRepository userAccountRepository;
    private final PasswordEncoder passwordEncoder;

    private static final int LATE_GRACE_MINUTES = 5;

    // Ca làm việc: start, end
    private record ShiftTime(LocalTime start, LocalTime end) {}
    private static ShiftTime shiftOf(String defaultShift) {
        if (defaultShift == null) return new ShiftTime(LocalTime.of(8, 0), LocalTime.of(18, 0));
        return switch (defaultShift) {
            case "CA_SANG"     -> new ShiftTime(LocalTime.of(7,  0), LocalTime.of(15, 0));
            case "CA_TOI"      -> new ShiftTime(LocalTime.of(15, 0), LocalTime.of(23, 0));
            default            -> new ShiftTime(LocalTime.of(9,  0), LocalTime.of(18, 0)); // HANH_CHINH
        };
    }

    @Override
    public List<Attendance> getFiltered(String branchId, String search, LocalDate dateFrom, LocalDate dateTo, String status) {
        return attendanceRepository.findFiltered(branchId, search, dateFrom, dateTo, status);
    }

    @Override
    public Attendance getAttendanceById(Long id) {
        return attendanceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy bản ghi chấm công!"));
    }

    @Override
    @Transactional
    public Attendance clockIn(String employeeId, String password) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy nhân viên!"));

        verifyPassword(employeeId, password);

        LocalDate today = LocalDate.now();
        if (attendanceRepository.findByEmployeeEmployeeIdAndDateWork(employeeId, today).isPresent())
            throw new RuntimeException("Hôm nay bạn đã check-in rồi!");

        LocalDateTime now = LocalDateTime.now();
        ShiftTime shift = shiftOf(employee.getDefaultShift());
        String status = now.toLocalTime().isAfter(shift.start().plusMinutes(LATE_GRACE_MINUTES)) ? "LATE" : "ON_TIME";

        return attendanceRepository.save(Attendance.builder()
                .employee(employee)
                .dateWork(today)
                .checkInTime(now)
                .status(status)
                .build());
    }

    @Override
    @Transactional
    public Attendance clockOut(String employeeId, String password) {
        verifyPassword(employeeId, password);

        LocalDate today = LocalDate.now();
        Attendance attendance = attendanceRepository.findByEmployeeEmployeeIdAndDateWork(employeeId, today)
                .orElseThrow(() -> new RuntimeException("Bạn chưa check-in hôm nay!"));

        if (attendance.getCheckOutTime() != null)
            throw new RuntimeException("Bạn đã check-out rồi!");

        LocalDateTime now = LocalDateTime.now();
        attendance.setCheckOutTime(now);

        // Tính tổng giờ
        if (attendance.getCheckInTime() != null) {
            double hours = Duration.between(attendance.getCheckInTime(), now).toMinutes() / 60.0;
            attendance.setTotalHours(BigDecimal.valueOf(hours).setScale(2, RoundingMode.HALF_UP));
        }

        // Kiểm tra về sớm
        ShiftTime shift = shiftOf(attendance.getEmployee().getDefaultShift());
        boolean earlyLeave = now.toLocalTime().isBefore(shift.end().minusMinutes(LATE_GRACE_MINUTES));
        if (earlyLeave) {
            if ("LATE".equals(attendance.getStatus())) {
                attendance.setNote("Đi trễ & về sớm");
            }
            attendance.setStatus("EARLY_LEAVE");
        } else if (!"LATE".equals(attendance.getStatus())) {
            attendance.setStatus("ON_TIME");
        }

        return attendanceRepository.save(attendance);
    }

    @Override
    public List<TodayAttendanceResponse> getTodayAttendance(String branchId) {
        LocalDate today = LocalDate.now();

        List<Employee> employees = (branchId != null)
                ? employeeRepository.findByBranchBranchIdAndStatus(branchId, "ACTIVE")
                : employeeRepository.findAll().stream()
                    .filter(e -> "ACTIVE".equals(e.getStatus())).collect(Collectors.toList());

        List<Attendance> todayRecords = (branchId != null)
                ? attendanceRepository.findByBranchAndDate(branchId, today)
                : attendanceRepository.findByDateWorkOrderByEmployeeFullNameAsc(today);

        Map<String, Attendance> recordMap = todayRecords.stream()
                .collect(Collectors.toMap(a -> a.getEmployee().getEmployeeId(), a -> a));

        return employees.stream().map(emp -> {
            Attendance att = recordMap.get(emp.getEmployeeId());
            String kioskStatus;
            if (att == null) {
                kioskStatus = "NOT_IN";
            } else if (att.getCheckOutTime() != null) {
                kioskStatus = "DONE";
            } else {
                kioskStatus = att.getStatus(); // ON_TIME hoặc LATE
            }
            return new TodayAttendanceResponse(
                    emp.getEmployeeId(),
                    emp.getFullName(),
                    emp.getPosition(),
                    emp.getDefaultShift(),
                    att != null ? att.getAttendanceId() : null,
                    att != null ? att.getCheckInTime() : null,
                    att != null ? att.getCheckOutTime() : null,
                    kioskStatus
            );
        }).collect(Collectors.toList());
    }

    private void verifyPassword(String employeeId, String password) {
        UserAccount account = userAccountRepository.findByEmployeeEmployeeId(employeeId)
                .orElseThrow(() -> new RuntimeException("Tài khoản không tồn tại cho nhân viên này!"));
        if (!passwordEncoder.matches(password, account.getPassword()))
            throw new RuntimeException("Mật khẩu không đúng!");
    }
}
