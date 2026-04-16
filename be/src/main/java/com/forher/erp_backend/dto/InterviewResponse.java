package com.forher.erp_backend.dto;

import com.forher.erp_backend.entity.Interview;
import java.time.LocalDateTime;

public record InterviewResponse(
        String interviewId,
        String candidateId,
        String candidateFullName,
        String candidateEmail,
        String interviewerEmployeeId,
        String interviewerName,
        LocalDateTime scheduledAt,
        String location,
        String status,
        String candidateStatus,
        Integer score,
        String feedback,
        LocalDateTime createdAt
) {
    public static InterviewResponse from(Interview i) {
        return new InterviewResponse(
                i.getInterviewId(),
                i.getCandidate().getCandidateId(),
                i.getCandidate().getFullName(),
                i.getCandidate().getEmail(),
                i.getInterviewer().getEmployeeId(),
                i.getInterviewer().getFullName(),
                i.getScheduledAt(),
                i.getLocation(),
                i.getStatus(),
                i.getCandidateStatus(),
                i.getScore(),
                i.getFeedback(),
                i.getCreatedAt()
        );
    }
}
