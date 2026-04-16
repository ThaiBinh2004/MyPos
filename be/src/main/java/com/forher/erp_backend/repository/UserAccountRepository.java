package com.forher.erp_backend.repository;

import com.forher.erp_backend.entity.UserAccount;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserAccountRepository extends JpaRepository<UserAccount, String> {
    // Hàm cực kỳ quan trọng để sau này làm tính năng Đăng nhập (Spring Security)
    Optional<UserAccount> findByUsername(String username);
    Optional<UserAccount> findByEmployeeEmployeeId(String employeeId);
}