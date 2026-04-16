package com.forher.erp_backend.service;

import com.forher.erp_backend.entity.Branch;
import com.forher.erp_backend.entity.Candidate;
import com.forher.erp_backend.entity.Employee;
import com.forher.erp_backend.repository.BranchRepository;
import com.forher.erp_backend.repository.CandidateRepository;
import com.forher.erp_backend.repository.EmployeeRepository;
import com.forher.erp_backend.service.Interface.ICandidateService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CandidateService implements ICandidateService {

    private final CandidateRepository candidateRepository;
    private final EmployeeRepository employeeRepository;
    private final BranchRepository branchRepository;
    private final EmailService emailService;

    @Override public List<Candidate> getAllCandidates() { return candidateRepository.findAll(); }

    @Override public Candidate getCandidateById(String id) {
        return candidateRepository.findById(id).orElseThrow(() -> new RuntimeException("Không tìm thấy ứng viên!"));
    }

    @Override @Transactional public Candidate createCandidate(Candidate candidate) {
        candidate.setStatus("NEW");
        return candidateRepository.save(candidate);
    }

    @Override @Transactional public void updateCandidateStatus(String id, String status) {
        Candidate candidate = getCandidateById(id);
        candidate.setStatus(status);
        candidateRepository.save(candidate);
    }

    @Override @Transactional public void scheduleInterview(String candidateId, String interviewDate) {
        Candidate candidate = getCandidateById(candidateId);
        candidate.setStatus("INTERVIEW_SCHEDULED: " + interviewDate);
        candidateRepository.save(candidate);
    }

    @Override @Transactional public void acceptCandidate(String candidateId) {
        Candidate candidate = getCandidateById(candidateId);
        candidate.setStatus("ACCEPTED");
        candidateRepository.save(candidate);
    }

    @Override @Transactional public void rejectCandidate(String candidateId) {
        Candidate candidate = getCandidateById(candidateId);
        candidate.setStatus("REJECTED");
        candidateRepository.save(candidate);
    }

    @Override @Transactional
    public void sendOffer(String candidateId, String branchId, String salary) {
        Candidate candidate = getCandidateById(candidateId);
        String token = UUID.randomUUID().toString();
        candidate.setOfferToken(token);
        candidate.setOfferStatus("sent");
        candidate.setBranchId(branchId);
        candidate.setOfferSalary(salary);
        candidateRepository.save(candidate);
        emailService.sendOfferLetter(
                candidate.getEmail(),
                candidate.getFullName(),
                candidate.getAppliedPosition(),
                salary,
                token
        );
    }

    @Override @Transactional
    public void acceptOffer(String token, String dateOfBirth, String idCard, String bankAccount) {
        Candidate candidate = candidateRepository.findByOfferToken(token)
                .orElseThrow(() -> new RuntimeException("Token không hợp lệ!"));

        candidate.setDateOfBirth(dateOfBirth);
        candidate.setIdCard(idCard);
        candidate.setBankAccount(bankAccount);
        candidate.setOfferStatus("accepted");
        candidate.setStatus("HIRED");

        Branch branch = branchRepository.findById(candidate.getBranchId())
                .orElseThrow(() -> new RuntimeException("Chi nhánh không tồn tại!"));

        long count = employeeRepository.count();
        String employeeId = String.format("EMP%03d", count + 1);

        Employee employee = Employee.builder()
                .employeeId(employeeId)
                .fullName(candidate.getFullName())
                .dateOfBirth(LocalDate.parse(dateOfBirth))
                .idCard(idCard)
                .phoneNumber(candidate.getPhoneNumber())
                .bankAccount(bankAccount)
                .position(candidate.getAppliedPosition())
                .status("ACTIVE")
                .branch(branch)
                .build();

        Employee saved = employeeRepository.save(employee);
        candidate.setEmployee(saved);
        candidateRepository.save(candidate);
    }

    @Override @Transactional
    public void declineOffer(String token) {
        Candidate candidate = candidateRepository.findByOfferToken(token)
                .orElseThrow(() -> new RuntimeException("Token không hợp lệ!"));
        candidate.setOfferStatus("declined");
        candidate.setStatus("REJECTED");
        candidateRepository.save(candidate);
    }
}
