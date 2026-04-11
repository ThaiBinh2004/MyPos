package com.forher.erp_backend.service.Interface;
import com.forher.erp_backend.entity.Candidate;

public interface ICandidateService {
    // Nghiệp vụ Tuyển dụng
    void scheduleInterview(String candidateId, String interviewDate);
    void acceptCandidate(String candidateId); // Nhận việc -> Sinh mã Employee
    void rejectCandidate(String candidateId); // Đánh trượt
}