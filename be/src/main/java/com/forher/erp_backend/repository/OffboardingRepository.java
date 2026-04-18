package com.forher.erp_backend.repository;

import com.forher.erp_backend.entity.Offboarding;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OffboardingRepository extends JpaRepository<Offboarding, String> {

    List<Offboarding> findAllByOrderByCreatedAtDesc();

    @Query("SELECT o FROM Offboarding o WHERE o.employee.branch.branchId = :branchId ORDER BY o.createdAt DESC")
    List<Offboarding> findByBranchOrderByCreatedAtDesc(@Param("branchId") String branchId);

    List<Offboarding> findByStatusOrderByCreatedAtDesc(String status);

    List<Offboarding> findByEmployeeEmployeeIdOrderByCreatedAtDesc(String employeeId);
}
