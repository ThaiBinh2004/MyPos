package com.forher.erp_backend.entity;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
@Entity
@Table(name = "ATTENDANCE_REQUEST")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class AttendanceRequest {
    @Id
    @Column(name = "request_id", length = 20)
    private String requestId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "attendance_id")
    private Attendance attendance; // nullable — trường hợp quên check-in hoàn toàn

    @Column(name = "reason", length = 500, nullable = false)
    private String reason;

    @Column(name = "requested_check_in")
    private LocalDateTime requestedCheckIn;

    @Column(name = "requested_check_out")
    private LocalDateTime requestedCheckOut;

    @Column(name = "request_date", nullable = false)
    private LocalDate requestDate;

    @Column(name = "status", length = 20, nullable = false)
    private String status;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "approved_by")
    private Employee approvedBy;

    @Column(name = "review_note", length = 255)
    private String reviewNote;
}
