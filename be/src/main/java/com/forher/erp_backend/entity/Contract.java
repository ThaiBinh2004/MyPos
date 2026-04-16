package com.forher.erp_backend.entity;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
@Entity
@Table(name = "CONTRACT")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Contract {

    @Id
    @Column(name = "contract_id", length = 20)
    private String contractId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    @Column(name = "contract_type", length = 50, nullable = false)
    private String contractType;

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "end_date")
    private LocalDate endDate;

    @Column(name = "base_salary", precision = 15, scale = 2, nullable = false)
    private BigDecimal baseSalary;

    @Column(name = "allowance", precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal allowance = BigDecimal.ZERO;

    @Column(name = "position", length = 100)
    private String position;

    @Column(name = "working_hours", length = 255)
    private String workingHours;

    @Column(name = "leave_policy", length = 500)
    private String leavePolicy;

    @Column(name = "other_terms", length = 1000)
    private String otherTerms;

    // DRAFT → PENDING → ACTIVE / REJECTED → TERMINATED / EXPIRED
    @Column(name = "status", length = 30, nullable = false)
    @Builder.Default
    private String status = "DRAFT";

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "approved_by")
    private Employee approvedBy;

    @Column(name = "approved_date")
    private LocalDateTime approvedDate;

    @Column(name = "reviewer_note", length = 500)
    private String reviewerNote;

    @Column(name = "signed_by_employee")
    @Builder.Default
    private Boolean signedByEmployee = false;

    @Column(name = "signed_date")
    private LocalDateTime signedDate;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
