package com.forher.erp_backend.repository;

import com.forher.erp_backend.entity.SalesReport;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SalesReportRepository extends JpaRepository<SalesReport, String> {
}