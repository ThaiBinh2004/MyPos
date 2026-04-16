package com.forher.erp_backend.repository;

import com.forher.erp_backend.entity.Interview;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface InterviewRepository extends JpaRepository<Interview, String> {
    List<Interview> findByCandidateCandidateIdOrderByScheduledAtDesc(String candidateId);
    List<Interview> findByInterviewerEmployeeIdOrderByScheduledAtDesc(String employeeId);
    java.util.Optional<Interview> findByConfirmToken(String confirmToken);
}
