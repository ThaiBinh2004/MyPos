package com.forher.erp_backend.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;

@Entity
@Table(name = "INTERVIEW")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Interview {

    @Id
    @Column(name = "interview_id", length = 20)
    private String interviewId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "candidate_id", nullable = false)
    private Candidate candidate;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "interviewer_id", nullable = false)
    private Employee interviewer;

    @Column(name = "scheduled_at", nullable = false)
    private LocalDateTime scheduledAt;

    @Column(name = "location", length = 200)
    private String location;

    // scheduled | completed | cancelled
    @Column(name = "status", length = 20, nullable = false)
    @Builder.Default
    private String status = "scheduled";

    // pending | confirmed | declined
    @Column(name = "candidate_status", length = 20, nullable = false)
    @Builder.Default
    private String candidateStatus = "pending";

    @Column(name = "confirm_token", length = 64, unique = true)
    private String confirmToken;

    @Column(name = "score")
    private Integer score;

    @Column(name = "feedback", length = 1000)
    private String feedback;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
