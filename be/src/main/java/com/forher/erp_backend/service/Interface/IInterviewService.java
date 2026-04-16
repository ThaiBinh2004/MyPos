package com.forher.erp_backend.service.Interface;

import com.forher.erp_backend.entity.Interview;
import java.time.LocalDateTime;
import java.util.List;

public interface IInterviewService {
    List<Interview> getByCandidate(String candidateId);
    List<Interview> getByInterviewer(String employeeId);
    Interview schedule(String candidateId, String interviewerEmployeeId, LocalDateTime scheduledAt, String location);
    void confirmByToken(String token);
    void declineByToken(String token);
    void submitScore(String interviewId, int score, String feedback);
    void cancel(String interviewId);
}
