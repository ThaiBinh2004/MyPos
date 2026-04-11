package com.forher.erp_backend.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;

@Entity
@Table(name = "RECRUITMENT_REQUEST")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class RecruitmentRequest {
    @Id
    @Column(name = "request_id", length = 20)
    private String requestId;

    @Column(name = "position", length = 100, nullable = false)
    private String position;

    @Column(name = "quantity", nullable = false)
    private Integer quantity;

    @Lob
    @Column(name = "description")
    private String description;

    @Column(name = "status", length = 20, nullable = false)
    private String status;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by", nullable = false)
    private Employee createdBy;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}