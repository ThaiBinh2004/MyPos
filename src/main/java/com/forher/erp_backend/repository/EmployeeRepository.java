package com.forher.erp_backend.repository;

import com.forher.erp_backend.entity.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface EmployeeRepository extends JpaRepository<Employee, String> {
    // Có thể tự định nghĩa thêm hàm tìm kiếm theo số điện thoại (ví dụ)
    // Optional<Employee> findByPhoneNumber(String phoneNumber);
}