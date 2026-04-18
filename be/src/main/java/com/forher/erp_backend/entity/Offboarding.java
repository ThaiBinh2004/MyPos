package com.forher.erp_backend.entity;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
@Entity
@Table(name = "OFFBOARDING")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Offboarding {

    @Id
    @Column(name = "offboarding_id", length = 20)
    private String offboardingId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "initiated_by", nullable = false)
    private Employee initiatedBy;

    @Column(name = "reason", length = 500, nullable = false)
    private String reason;

    @Column(name = "last_working_date", nullable = false)
    private LocalDate lastWorkingDate;

    // INITIATED → ASSETS_PENDING → ASSETS_CONFIRMED → PENDING_APPROVAL → COMPLETED / REJECTED
    @Column(name = "status", length = 30, nullable = false)
    @Builder.Default
    private String status = "INITIATED";

    @Column(name = "director_note", length = 500)
    private String directorNote;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "approved_by")
    private Employee approvedBy;

    @Column(name = "approved_date")
    private LocalDateTime approvedDate;

    // Nhân viên xác nhận đã bàn giao tài sản
    @Column(name = "employee_confirmed")
    @Builder.Default
    private Boolean employeeConfirmed = false;

    @Column(name = "employee_confirmed_at")
    private LocalDateTime employeeConfirmedAt;

    // Kế toán quyết toán
    // SALARY_DEDUCTION | DIRECT_PAYMENT | NONE
    @Column(name = "settlement_method", length = 30)
    private String settlementMethod;

    @Column(name = "settlement_note", length = 500)
    private String settlementNote;

    @Column(name = "settled_at")
    private LocalDateTime settledAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "settled_by")
    private Employee settledBy;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
