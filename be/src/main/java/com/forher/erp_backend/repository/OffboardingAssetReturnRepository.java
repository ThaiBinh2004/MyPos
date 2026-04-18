package com.forher.erp_backend.repository;

import com.forher.erp_backend.entity.OffboardingAssetReturn;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OffboardingAssetReturnRepository extends JpaRepository<OffboardingAssetReturn, String> {
    List<OffboardingAssetReturn> findByOffboardingOffboardingId(String offboardingId);
}
