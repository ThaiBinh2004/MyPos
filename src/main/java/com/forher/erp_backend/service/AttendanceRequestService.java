package com.forher.erp_backend.service;

import com.forher.erp_backend.entity.AttendanceRequest;
import com.forher.erp_backend.entity.Employee;
import com.forher.erp_backend.repository.AttendanceRequestRepository;
import com.forher.erp_backend.repository.EmployeeRepository;
import com.forher.erp_backend.service.Interface.IAttendanceRequestService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AttendanceRequestService implements IAttendanceRequestService {

    private final AttendanceRequestRepository requestRepository;
    private final EmployeeRepository employeeRepository;

    @Override
    @Transactional
    public void approveRequest(String requestId, String managerId) {
        AttendanceRequest request = requestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy yêu cầu sửa công!"));
        Employee manager = employeeRepository.findById(managerId).orElse(null);

        request.setStatus("APPROVED");
        request.setApprovedBy(manager);
        requestRepository.save(request);

        // Thực tế sẽ update thêm bảng Attendance ở đây tùy logic
    }

    @Override
    @Transactional
    public void rejectRequest(String requestId, String managerId) {
        AttendanceRequest request = requestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy yêu cầu sửa công!"));
        Employee manager = employeeRepository.findById(managerId).orElse(null);

        request.setStatus("REJECTED");
        request.setApprovedBy(manager);
        requestRepository.save(request);
    }
}