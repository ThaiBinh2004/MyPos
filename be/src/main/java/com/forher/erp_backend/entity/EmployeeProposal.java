package com.forher.erp_backend.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;

@Entity
@Table(name = "EMPLOYEE_PROPOSAL")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class EmployeeProposal {

    @Id
    @Column(name = "proposal_id", length = 30)
    private String proposalId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    @Column(name = "proposed_by", length = 20, nullable = false)
    private String proposedBy; // employeeId của người đề xuất

    @Column(name = "proposed_by_name", length = 100)
    private String proposedByName;

    @Column(name = "proposed_position", length = 100)
    private String proposedPosition;

    @Column(name = "proposed_department", length = 100)
    private String proposedDepartment;

    @Column(name = "reason", length = 500)
    private String reason;

    // pending | approved | rejected
    @Column(name = "status", length = 20, nullable = false)
    @Builder.Default
    private String status = "pending";

    @Column(name = "reviewer_note", length = 500)
    private String reviewerNote;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
