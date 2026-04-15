package com.forher.erp_backend.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "USER_ACCOUNT") // Bắt buộc đổi tên để né từ khóa USER của Oracle
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class UserAccount {
    @Id
    @Column(name = "account_id", length = 20)
    private String accountId;

    @Column(name = "username", length = 50, unique = true, nullable = false)
    private String username;

    @Column(name = "password", length = 255, nullable = false)
    private String password;

    @Column(name = "role", length = 50)
    private String role; // Ví dụ: ADMIN, HR_MANAGER, SALES_STAFF...

    @Column(name = "is_active")
    private Integer isActive = 1; // Trạng thái khóa/mở tài khoản

    // Mối quan hệ 1-1: Mỗi tài khoản thường gắn với 1 nhân viên cụ thể
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", unique = true)
    private Employee employee;
}