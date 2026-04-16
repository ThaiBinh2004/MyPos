package com.forher.erp_backend.repository;

import com.forher.erp_backend.entity.Attendance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface AttendanceRepository extends JpaRepository<Attendance, Long> {

    Optional<Attendance> findByEmployeeEmployeeIdAndDateWork(String employeeId, LocalDate dateWork);

    List<Attendance> findByDateWorkOrderByEmployeeFullNameAsc(LocalDate dateWork);

    List<Attendance> findByEmployeeEmployeeIdOrderByDateWorkDesc(String employeeId);

    @Query("SELECT a FROM Attendance a WHERE a.employee.branch.branchId = :branchId AND a.dateWork = :dateWork ORDER BY a.employee.fullName ASC")
    List<Attendance> findByBranchAndDate(@Param("branchId") String branchId, @Param("dateWork") LocalDate dateWork);

    @Query("SELECT a FROM Attendance a WHERE a.dateWork = :dateWork AND a.checkOutTime IS NULL AND a.checkInTime IS NOT NULL")
    List<Attendance> findCheckedInWithoutCheckout(@Param("dateWork") LocalDate dateWork);

    @Query("SELECT a FROM Attendance a WHERE (:branchId IS NULL OR a.employee.branch.branchId = :branchId)" +
           " AND (:search IS NULL OR LOWER(a.employee.employeeId) LIKE LOWER(CONCAT('%', :search, '%'))" +
           "   OR :search IS NULL OR LOWER(a.employee.fullName) LIKE LOWER(CONCAT('%', :search, '%')))" +
           " AND (:dateFrom IS NULL OR a.dateWork >= :dateFrom)" +
           " AND (:dateTo IS NULL OR a.dateWork <= :dateTo)" +
           " AND (:status IS NULL OR UPPER(a.status) = UPPER(:status))" +
           " ORDER BY a.dateWork DESC, a.employee.fullName ASC")
    List<Attendance> findFiltered(
            @Param("branchId") String branchId,
            @Param("search") String search,
            @Param("dateFrom") LocalDate dateFrom,
            @Param("dateTo") LocalDate dateTo,
            @Param("status") String status);
}
