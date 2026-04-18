package com.forher.erp_backend.repository;

import com.forher.erp_backend.entity.StockTransfer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface StockTransferRepository extends JpaRepository<StockTransfer, String> {
    List<StockTransfer> findAllByOrderByCreatedAtDesc();
    List<StockTransfer> findByFromBranchBranchIdOrToBranchBranchIdOrderByCreatedAtDesc(String fromBranchId, String toBranchId);
}
