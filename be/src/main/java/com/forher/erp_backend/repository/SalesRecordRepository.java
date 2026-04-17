package com.forher.erp_backend.repository;

import com.forher.erp_backend.entity.SalesRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SalesRecordRepository extends JpaRepository<SalesRecord, Long> {

    List<SalesRecord> findByEmployeeEmployeeIdAndMonth(String employeeId, String month);

    @Query("SELECT s FROM SalesRecord s WHERE s.month = :month" +
           " AND (:branchId IS NULL OR s.employee.branch.branchId = :branchId)" +
           " ORDER BY s.shiftDate DESC, s.employee.fullName ASC")
    List<SalesRecord> findByMonthAndBranch(@Param("month") String month,
                                           @Param("branchId") String branchId);

    void deleteByEmployeeEmployeeIdAndMonth(String employeeId, String month);
}
