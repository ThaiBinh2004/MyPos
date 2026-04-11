package com.forher.erp_backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "ASSET_HANDOVER")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class AssetHandover {
    @Id
    @Column(name = "handover_id", length = 20)
    private String handoverId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    @Column(name = "issue_date", nullable = false)
    private LocalDate issueDate;

    @Lob
    @Column(name = "asset_list", nullable = false)
    private String assetList; // JSON

    @Column(name = "asset_condition", length = 30, nullable = false)
    private String assetCondition;

    @Column(name = "status", length = 20, nullable = false)
    private String status;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "approved_by")
    private Employee approvedBy;
}