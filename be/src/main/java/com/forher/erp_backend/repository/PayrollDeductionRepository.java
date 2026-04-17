package com.forher.erp_backend.repository;

import com.forher.erp_backend.entity.PayrollDeduction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PayrollDeductionRepository extends JpaRepository<PayrollDeduction, Long> {

    List<PayrollDeduction> findByEmployeeEmployeeIdAndMonth(String employeeId, String month);

    @Query("SELECT d FROM PayrollDeduction d WHERE d.month = :month" +
           " AND (:branchId IS NULL OR d.employee.branch.branchId = :branchId)" +
           " ORDER BY d.deductionDate DESC")
    List<PayrollDeduction> findByMonthAndBranch(@Param("month") String month,
                                                @Param("branchId") String branchId);
}
