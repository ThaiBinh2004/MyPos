package com.forher.erp_backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "ASSET")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Asset {
    @Id
    @Column(name = "asset_id", length = 20)
    private String assetId;

    @Column(name = "asset_name", length = 200, nullable = false)
    private String assetName;

    @Column(name = "asset_type", length = 100, nullable = false)
    private String assetType;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id")
    private Employee employee;

    @Column(name = "handover_date")
    private LocalDate handoverDate;

    @Column(name = "asset_condition", length = 30, nullable = false)
    private String assetCondition;

    @Column(name = "asset_value", precision = 15, scale = 2)
    private BigDecimal assetValue;
}