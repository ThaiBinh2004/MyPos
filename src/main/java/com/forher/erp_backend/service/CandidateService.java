package com.forher.erp_backend.service;

import com.forher.erp_backend.entity.Candidate;
import com.forher.erp_backend.repository.CandidateRepository;
import com.forher.erp_backend.service.Interface.ICandidateService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CandidateService implements ICandidateService {

    private final CandidateRepository candidateRepository;

    @Override
    @Transactional
    public void scheduleInterview(String candidateId, String interviewDate) {
        Candidate candidate = candidateRepository.findById(candidateId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy ứng viên"));
        // Trong thực tế sẽ có bảng Interview, ở đây lưu tạm vào status
        candidate.setStatus("INTERVIEW_SCHEDULED: " + interviewDate);
        candidateRepository.save(candidate);
    }

    @Override
    @Transactional
    public void acceptCandidate(String candidateId) {
        Candidate candidate = candidateRepository.findById(candidateId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy ứng viên"));
        candidate.setStatus("ACCEPTED");
        candidateRepository.save(candidate);

        // Ghi chú: Ở một hệ thống xịn, chỗ này sẽ tự động gọi employeeRepository.save(...)
        // để đẩy thông tin Candidate sang làm một Employee mới tinh luôn!
    }

    @Override
    @Transactional
    public void rejectCandidate(String candidateId) {
        Candidate candidate = candidateRepository.findById(candidateId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy ứng viên"));
        candidate.setStatus("REJECTED");
        candidateRepository.save(candidate);
    }
}