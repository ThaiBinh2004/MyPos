package com.forher.erp_backend.service;

import com.forher.erp_backend.entity.RecruitmentRequest;
import com.forher.erp_backend.repository.RecruitmentRequestRepository;
import com.forher.erp_backend.service.Interface.IRecruitmentRequestService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class RecruitmentRequestService implements IRecruitmentRequestService {

    private final RecruitmentRequestRepository repository;

    @Override
    @Transactional
    public void approveRequest(String requestId) {
        RecruitmentRequest request = repository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy yêu cầu tuyển dụng!"));
        request.setStatus("APPROVED");
        repository.save(request);
    }

    @Override
    @Transactional
    public void closeRequest(String requestId) {
        RecruitmentRequest request = repository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy yêu cầu tuyển dụng!"));
        request.setStatus("CLOSED");
        repository.save(request);
    }
}