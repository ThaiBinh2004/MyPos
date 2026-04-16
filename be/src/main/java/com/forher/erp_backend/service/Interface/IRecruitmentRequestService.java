package com.forher.erp_backend.service.Interface;
import com.forher.erp_backend.entity.RecruitmentRequest;
import java.util.List;

public interface IRecruitmentRequestService {
    List<RecruitmentRequest> getAllRequests();
    RecruitmentRequest getRequestById(String id);
    RecruitmentRequest createRequest(RecruitmentRequest request);
    void approveRequest(String requestId);
    void closeRequest(String requestId);
}
