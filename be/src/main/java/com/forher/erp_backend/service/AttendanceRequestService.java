package com.forher.erp_backend.service;

import com.forher.erp_backend.entity.AttendanceRequest;
import com.forher.erp_backend.entity.Employee;
import com.forher.erp_backend.repository.AttendanceRequestRepository;
import com.forher.erp_backend.repository.EmployeeRepository;
import com.forher.erp_backend.service.Interface.IAttendanceRequestService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AttendanceRequestService implements IAttendanceRequestService {

    private final AttendanceRequestRepository requestRepository;
    private final EmployeeRepository employeeRepository;

    @Override public List<AttendanceRequest> getAllRequests() { return requestRepository.findAll(); }

    @Override @Transactional
    public AttendanceRequest createRequest(AttendanceRequest request) {
        request.setStatus("PENDING");
        return requestRepository.save(request);
    }

    @Override @Transactional
    public void approveRequest(String requestId, String managerId) {
        AttendanceRequest request = requestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn!"));
        Employee manager = employeeRepository.findById(managerId).orElse(null);
        request.setStatus("APPROVED");
        request.setApprovedBy(manager);
        requestRepository.save(request);
    }

    @Override @Transactional
    public void rejectRequest(String requestId, String managerId) {
        AttendanceRequest request = requestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn!"));
        Employee manager = employeeRepository.findById(managerId).orElse(null);
        request.setStatus("REJECTED");
        request.setApprovedBy(manager);
        requestRepository.save(request);
    }
}
