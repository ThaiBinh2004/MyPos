package com.forher.erp_backend.repository;

import com.forher.erp_backend.entity.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface BranchRepository extends JpaRepository<Branch, String> {
}