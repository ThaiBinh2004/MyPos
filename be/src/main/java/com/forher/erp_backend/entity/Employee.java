package com.forher.erp_backend.entity;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDate;
import java.time.LocalDateTime;

@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
@Entity
@Table(name = "EMPLOYEE")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Employee {

    @Id
    @Column(name = "employee_id", length = 20)
    private String employeeId;

    @Column(name = "full_name", length = 100, nullable = false)
    private String fullName;

    @Column(name = "date_of_birth", nullable = false)
    private LocalDate dateOfBirth;

    @Column(name = "id_card", length = 20, nullable = false, unique = true)
    private String idCard;

    @Column(name = "email", length = 150)
    private String email;

    @Column(name = "phone_number", length = 15)
    private String phoneNumber;

    @Column(name = "bank_account", length = 30)
    private String bankAccount;

    @Column(name = "position", length = 100, nullable = false)
    private String position;

    @Column(name = "status", length = 20, nullable = false)
    @Builder.Default
    private String status = "ACTIVE";

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "branch_id", nullable = false)
    private Branch branch;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}