package com.forher.erp_backend.service;

import com.forher.erp_backend.entity.Attendance;
import com.forher.erp_backend.entity.AttendanceRequest;
import com.forher.erp_backend.entity.Employee;
import com.forher.erp_backend.repository.AttendanceRepository;
import com.forher.erp_backend.repository.AttendanceRequestRepository;
import com.forher.erp_backend.repository.EmployeeRepository;
import com.forher.erp_backend.service.Interface.IAttendanceRequestService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AttendanceRequestService implements IAttendanceRequestService {

    private final AttendanceRequestRepository requestRepository;
    private final AttendanceRepository attendanceRepository;
    private final EmployeeRepository employeeRepository;

    @Override
    public List<AttendanceRequest> getFiltered(String branchId, String status) {
        return requestRepository.findFiltered(branchId, status);
    }

    @Override
    public List<AttendanceRequest> getByEmployee(String employeeId) {
        return requestRepository.findByEmployeeEmployeeIdOrderByRequestDateDesc(employeeId);
    }

    @Override
    @Transactional
    public AttendanceRequest createRequest(String employeeId, Long attendanceId,
                                           LocalDateTime requestedCheckIn, LocalDateTime requestedCheckOut,
                                           String reason) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy nhân viên!"));

        // Nếu không có bản ghi chấm công (quên check-in hoàn toàn) → tạo placeholder
        Attendance attendance;
        if (attendanceId != null) {
            attendance = attendanceRepository.findById(attendanceId)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy bản ghi chấm công!"));
        } else {
            LocalDate today = LocalDate.now();
            attendance = attendanceRepository
                    .findByEmployeeEmployeeIdAndDateWork(employee.getEmployeeId(), today)
                    .orElseGet(() -> attendanceRepository.save(Attendance.builder()
                            .employee(employee)
                            .dateWork(today)
                            .status("MISSING_CHECKOUT")
                            .build()));
        }

        String requestId = "REQ-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();

        return requestRepository.save(AttendanceRequest.builder()
                .requestId(requestId)
                .employee(employee)
                .attendance(attendance)
                .requestedCheckIn(requestedCheckIn)
                .requestedCheckOut(requestedCheckOut)
                .reason(reason)
                .requestDate(LocalDate.now())
                .status("PENDING")
                .build());
    }

    @Override
    @Transactional
    public void approveRequest(String requestId, String managerId, String reviewNote) {
        AttendanceRequest request = requestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn sửa công!"));
        Employee manager = employeeRepository.findById(managerId).orElse(null);

        request.setStatus("APPROVED");
        request.setApprovedBy(manager);
        request.setReviewNote(reviewNote);
        requestRepository.save(request);

        // Áp dụng thời gian đã điều chỉnh vào bản ghi chấm công
        Attendance att = request.getAttendance();
        if (att == null && request.getRequestedCheckIn() != null) {
            // Nhân viên quên check-in hoàn toàn → tạo bản ghi mới
            att = Attendance.builder()
                    .employee(request.getEmployee())
                    .dateWork(request.getRequestedCheckIn().toLocalDate())
                    .status("CORRECTED")
                    .build();
        }
        if (att != null) {
            if (request.getRequestedCheckIn()  != null) att.setCheckInTime(request.getRequestedCheckIn());
            if (request.getRequestedCheckOut() != null) att.setCheckOutTime(request.getRequestedCheckOut());
            if (att.getCheckInTime() != null && att.getCheckOutTime() != null) {
                double hours = Duration.between(att.getCheckInTime(), att.getCheckOutTime()).toMinutes() / 60.0;
                att.setTotalHours(BigDecimal.valueOf(hours).setScale(2, RoundingMode.HALF_UP));
            }
            att.setStatus("CORRECTED");
            att.setNote("Đã điều chỉnh bởi " + (manager != null ? manager.getFullName() : "quản lý"));
            attendanceRepository.save(att);
        }
    }

    @Override
    @Transactional
    public void rejectRequest(String requestId, String managerId, String reviewNote) {
        AttendanceRequest request = requestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn sửa công!"));
        Employee manager = employeeRepository.findById(managerId).orElse(null);
        request.setStatus("REJECTED");
        request.setApprovedBy(manager);
        request.setReviewNote(reviewNote);
        requestRepository.save(request);
    }
}
