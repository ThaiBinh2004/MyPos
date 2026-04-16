package com.forher.erp_backend.repository;

import com.forher.erp_backend.entity.Orders;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface OrdersRepository extends JpaRepository<Orders, String> {
}