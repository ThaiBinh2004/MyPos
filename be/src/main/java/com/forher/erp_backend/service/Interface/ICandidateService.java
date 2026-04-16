package com.forher.erp_backend.service.Interface;
import com.forher.erp_backend.entity.Candidate;
import java.util.List;

public interface ICandidateService {
    List<Candidate> getAllCandidates();
    Candidate getCandidateById(String id);
    Candidate createCandidate(Candidate candidate);
    void updateCandidateStatus(String id, String status);
    void scheduleInterview(String candidateId, String interviewDate);
    void acceptCandidate(String candidateId);
    void rejectCandidate(String candidateId);
    void sendOffer(String candidateId, String branchId, String salary);
    void acceptOffer(String token, String dateOfBirth, String idCard, String bankAccount);
    void declineOffer(String token);
}
