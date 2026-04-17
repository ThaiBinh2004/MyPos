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
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Employee {

    @Id
    @Column(name = "employee_id", length = 20)
    private String employeeId;

    @Column(name = "full_name", length = 100, nullable = false)
    private String fullName;

    @Column(name = "date_of_birth", nullable = false)
    private LocalDate dateOfBirth;

    @Column(name = "gender", length = 10)
    private String gender; // MALE | FEMALE | OTHER

    @Column(name = "id_card", length = 20, nullable = false, unique = true)
    private String idCard;

    @Column(name = "email", length = 150)
    private String email;

    @Column(name = "phone_number", length = 15)
    private String phoneNumber;

    @Column(name = "address", length = 255)
    private String address;

    @Column(name = "bank_account", length = 30)
    private String bankAccount;

    @Column(name = "position", length = 100, nullable = false)
    private String position;

    @Column(name = "department", length = 100)
    private String department;

    // Ca làm việc mặc định: HANH_CHINH | CA_SANG | CA_TOI
    @Column(name = "default_shift", length = 20)
    private String defaultShift;

    // Số người phụ thuộc (giảm trừ gia cảnh TNCN: 4.4tr/người)
    @Column(name = "dependents")
    @Builder.Default
    private Integer dependents = 0;

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
