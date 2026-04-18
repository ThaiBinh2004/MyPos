package com.forher.erp_backend.repository;

import com.forher.erp_backend.entity.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AssetRepository extends JpaRepository<Asset, String> {
    List<Asset> findByEmployeeEmployeeId(String employeeId);
}
