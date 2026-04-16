package com.forher.erp_backend.repository;

import com.forher.erp_backend.entity.EmployeeProposal;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface EmployeeProposalRepository extends JpaRepository<EmployeeProposal, String> {
    List<EmployeeProposal> findByStatusOrderByCreatedAtDesc(String status);
    List<EmployeeProposal> findByEmployeeEmployeeIdOrderByCreatedAtDesc(String employeeId);
    List<EmployeeProposal> findByProposedByOrderByCreatedAtDesc(String proposedBy);
}
