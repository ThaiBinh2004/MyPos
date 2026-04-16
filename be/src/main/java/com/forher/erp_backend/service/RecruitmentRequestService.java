package com.forher.erp_backend.service;

import com.forher.erp_backend.entity.RecruitmentRequest;
import com.forher.erp_backend.repository.RecruitmentRequestRepository;
import com.forher.erp_backend.service.Interface.IRecruitmentRequestService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class RecruitmentRequestService implements IRecruitmentRequestService {

    private final RecruitmentRequestRepository repository;

    @Override public List<RecruitmentRequest> getAllRequests() { return repository.findAll(); }

    @Override public RecruitmentRequest getRequestById(String id) {
        return repository.findById(id).orElseThrow(() -> new RuntimeException("Không tìm thấy yêu cầu tuyển dụng!"));
    }

    @Override @Transactional public RecruitmentRequest createRequest(RecruitmentRequest request) {
        request.setStatus("OPEN");
        return repository.save(request);
    }

    @Override @Transactional public void approveRequest(String requestId) {
        RecruitmentRequest request = getRequestById(requestId);
        request.setStatus("APPROVED");
        repository.save(request);
    }

    @Override @Transactional public void closeRequest(String requestId) {
        RecruitmentRequest request = getRequestById(requestId);
        request.setStatus("CLOSED");
        repository.save(request);
    }
}
