package com.forher.erp_backend.repository;

import com.forher.erp_backend.entity.StockAudit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface StockAuditRepository extends JpaRepository<StockAudit, String> {
    List<StockAudit> findAllByOrderByCreatedAtDesc();
    List<StockAudit> findByBranchBranchIdOrderByCreatedAtDesc(String branchId);
}
