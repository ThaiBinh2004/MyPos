package com.forher.erp_backend.repository;

import com.forher.erp_backend.entity.Contract;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface ContractRepository extends JpaRepository<Contract, String> {

    List<Contract> findByEmployeeEmployeeIdOrderByStartDateDesc(String employeeId);

    List<Contract> findByEmployeeBranchBranchIdOrderByStartDateDesc(String branchId);

    List<Contract> findByStatusOrderByStartDateDesc(String status);

    List<Contract> findByEmployeeBranchBranchIdAndStatusOrderByStartDateDesc(String branchId, String status);

    @Query("SELECT c FROM Contract c WHERE c.status = 'ACTIVE' AND c.endDate IS NOT NULL AND c.endDate <= :threshold ORDER BY c.endDate ASC")
    List<Contract> findExpiringContracts(@Param("threshold") LocalDate threshold);

    @Query("SELECT c FROM Contract c WHERE c.status = 'ACTIVE' AND c.endDate IS NOT NULL AND c.endDate <= :threshold AND c.employee.branch.branchId = :branchId ORDER BY c.endDate ASC")
    List<Contract> findExpiringContractsByBranch(@Param("threshold") LocalDate threshold, @Param("branchId") String branchId);
}
