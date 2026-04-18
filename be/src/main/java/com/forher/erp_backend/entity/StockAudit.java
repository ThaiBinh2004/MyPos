package com.forher.erp_backend.entity;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;

@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
@Entity
@Table(name = "STOCK_AUDIT")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class StockAudit {

    @Id
    @Column(name = "audit_id", length = 20)
    private String auditId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "branch_id", nullable = false)
    private Branch branch;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(name = "system_quantity", nullable = false)
    private Integer systemQuantity;

    @Column(name = "actual_quantity", nullable = false)
    private Integer actualQuantity;

    @Column(name = "difference", nullable = false)
    private Integer difference;

    @Column(name = "status", length = 20, nullable = false)
    @Builder.Default
    private String status = "PENDING";

    @Column(name = "note", length = 500)
    private String note;

    @Column(name = "resolved_note", length = 500)
    private String resolvedNote;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "audited_by")
    private Employee auditedBy;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "resolved_at")
    private LocalDateTime resolvedAt;
}
