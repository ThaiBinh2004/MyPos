package com.forher.erp_backend.repository;

import com.forher.erp_backend.entity.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface EmployeeRepository extends JpaRepository<Employee, String> {
    java.util.List<Employee> findByBranchBranchId(String branchId);
    java.util.List<Employee> findByBranchBranchIdAndStatus(String branchId, String status);
}