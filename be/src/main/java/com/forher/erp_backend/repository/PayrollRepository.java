package com.forher.erp_backend.repository;

import com.forher.erp_backend.entity.Payroll;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PayrollRepository extends JpaRepository<Payroll, String> {

    Optional<Payroll> findByEmployeeEmployeeIdAndMonth(String employeeId, String month);

    List<Payroll> findByEmployeeEmployeeIdOrderByMonthDesc(String employeeId);

    @Query("SELECT p FROM Payroll p WHERE p.month = :month" +
           " AND (:branchId IS NULL OR p.employee.branch.branchId = :branchId)" +
           " AND (:branchId IS NULL OR p.employee.employeeId NOT IN (SELECT ua.employee.employeeId FROM UserAccount ua WHERE ua.role = 'director'))" +
           " ORDER BY p.employee.fullName ASC")
    List<Payroll> findByMonthAndBranch(@Param("month") String month,
                                       @Param("branchId") String branchId);
}