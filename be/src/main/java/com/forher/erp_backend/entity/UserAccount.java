package com.forher.erp_backend.entity;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.*;

@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
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
    @Builder.Default
    private Boolean isActive = true;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id")
    private Employee employee;
}