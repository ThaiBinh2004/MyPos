package com.forher.erp_backend.service.Interface;
import com.forher.erp_backend.entity.Candidate;

public interface IRecruitmentRequestService {
    void approveRequest(String requestId);
    void closeRequest(String requestId);
}