package com.forher.erp_backend.repository;

import com.forher.erp_backend.entity.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, String> {

    @Query("SELECT p FROM Product p WHERE " +
           "(:search IS NULL OR LOWER(p.productName) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(p.sku) LIKE LOWER(CONCAT('%', :search, '%'))) AND " +
           "(:categoryId IS NULL OR p.category.categoryId = :categoryId) AND " +
           "(:status IS NULL OR p.status = :status)")
    List<Product> search(@Param("search") String search,
                         @Param("categoryId") String categoryId,
                         @Param("status") String status);
}