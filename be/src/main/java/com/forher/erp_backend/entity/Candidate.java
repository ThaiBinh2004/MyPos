package com.forher.erp_backend.entity;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;

@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
@Entity
@Table(name = "CANDIDATE")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Candidate {
    @Id
    @Column(name = "candidate_id", length = 20)
    private String candidateId;

    @Column(name = "full_name", length = 100, nullable = false)
    private String fullName;

    @Column(name = "email", length = 150, nullable = false, unique = true)
    private String email;

    @Column(name = "phone_number", length = 15)
    private String phoneNumber;

    @Column(name = "applied_position", length = 100, nullable = false)
    private String appliedPosition;

    @Column(name = "source", length = 100)
    private String source;

    @Column(name = "status", length = 30, nullable = false)
    private String status;

    @Column(name = "offer_status", length = 20)
    @Builder.Default
    private String offerStatus = "none";

    @Column(name = "offer_token", length = 100)
    private String offerToken;

    @Column(name = "offer_salary", length = 50)
    private String offerSalary;

    @Column(name = "date_of_birth", length = 10)
    private String dateOfBirth;

    @Column(name = "id_card", length = 20)
    private String idCard;

    @Column(name = "bank_account", length = 30)
    private String bankAccount;

    @Column(name = "branch_id", length = 20)
    private String branchId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id")
    private Employee employee;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
