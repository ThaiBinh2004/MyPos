package com.forher.erp_backend.service;

import com.forher.erp_backend.entity.Candidate;
import com.forher.erp_backend.entity.Employee;
import com.forher.erp_backend.entity.Interview;
import com.forher.erp_backend.repository.CandidateRepository;
import com.forher.erp_backend.repository.EmployeeRepository;
import com.forher.erp_backend.repository.InterviewRepository;
import com.forher.erp_backend.service.Interface.IInterviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class InterviewService implements IInterviewService {

    private final InterviewRepository interviewRepository;
    private final CandidateRepository candidateRepository;
    private final EmployeeRepository employeeRepository;
    private final EmailService emailService;

    @Override
    public List<Interview> getByCandidate(String candidateId) {
        return interviewRepository.findByCandidateCandidateIdOrderByScheduledAtDesc(candidateId);
    }

    @Override
    public List<Interview> getByInterviewer(String employeeId) {
        return interviewRepository.findByInterviewerEmployeeIdOrderByScheduledAtDesc(employeeId);
    }

    @Override
    @Transactional
    public Interview schedule(String candidateId, String interviewerEmployeeId,
                              LocalDateTime scheduledAt, String location) {
        Candidate candidate = candidateRepository.findById(candidateId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy ứng viên!"));
        Employee interviewer = employeeRepository.findById(interviewerEmployeeId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người phỏng vấn!"));

        String token = UUID.randomUUID().toString().replace("-", "");
        Interview interview = Interview.builder()
                .interviewId("ITV-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase())
                .candidate(candidate)
                .interviewer(interviewer)
                .scheduledAt(scheduledAt)
                .location(location)
                .status("scheduled")
                .candidateStatus("pending")
                .confirmToken(token)
                .build();
        Interview saved = interviewRepository.save(interview);

        if (candidate.getEmail() != null && !candidate.getEmail().isBlank()) {
            emailService.sendInterviewInviteToCandidate(
                    candidate.getEmail(), candidate.getFullName(),
                    candidate.getAppliedPosition(), scheduledAt, location, null);
        }

        if (interviewer.getEmail() != null && !interviewer.getEmail().isBlank()) {
            emailService.sendInterviewNotifyToInterviewer(
                    interviewer.getEmail(), interviewer.getFullName(),
                    candidate.getFullName(), candidate.getAppliedPosition(),
                    scheduledAt, location);
        }

        return saved;
    }

    @Override
    @Transactional
    public void confirmByToken(String token) {
        Interview interview = interviewRepository.findByConfirmToken(token)
                .orElseThrow(() -> new RuntimeException("Link không hợp lệ!"));
        interview.setCandidateStatus("confirmed");
        interviewRepository.save(interview);
    }

    @Override
    @Transactional
    public void declineByToken(String token) {
        Interview interview = interviewRepository.findByConfirmToken(token)
                .orElseThrow(() -> new RuntimeException("Link không hợp lệ!"));
        interview.setCandidateStatus("declined");
        interviewRepository.save(interview);
    }

    @Override
    @Transactional
    public void submitScore(String interviewId, int score, String feedback) {
        Interview interview = interviewRepository.findById(interviewId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy lịch phỏng vấn!"));
        if (score < 1 || score > 10)
            throw new RuntimeException("Điểm phải từ 1 đến 10!");
        interview.setScore(score);
        interview.setFeedback(feedback);
        interview.setStatus("completed");
        interviewRepository.save(interview);
    }

    @Override
    @Transactional
    public void cancel(String interviewId) {
        Interview interview = interviewRepository.findById(interviewId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy lịch phỏng vấn!"));
        interview.setStatus("cancelled");
        interviewRepository.save(interview);
    }
}
