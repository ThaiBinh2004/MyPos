package com.forher.erp_backend.repository;

import com.forher.erp_backend.entity.AttendanceRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AttendanceRequestRepository extends JpaRepository<AttendanceRequest, String> {

    List<AttendanceRequest> findByEmployeeEmployeeIdOrderByRequestDateDesc(String employeeId);

    @Query("SELECT r FROM AttendanceRequest r WHERE (:branchId IS NULL OR r.employee.branch.branchId = :branchId)" +
           " AND (:status IS NULL OR UPPER(r.status) = UPPER(:status))" +
           " ORDER BY r.requestDate DESC")
    List<AttendanceRequest> findFiltered(@Param("branchId") String branchId, @Param("status") String status);
}
