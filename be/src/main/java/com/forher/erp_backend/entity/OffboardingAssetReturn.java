package com.forher.erp_backend.entity;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
@Entity
@Table(name = "OFFBOARDING_ASSET_RETURN")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class OffboardingAssetReturn {

    @Id
    @Column(name = "return_id", length = 20)
    private String returnId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "offboarding_id", nullable = false)
    private Offboarding offboarding;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "asset_id", nullable = false)
    private Asset asset;

    // PENDING | RETURNED_GOOD | RETURNED_DAMAGED | MISSING
    @Column(name = "return_status", length = 30, nullable = false)
    @Builder.Default
    private String returnStatus = "PENDING";

    @Column(name = "return_date")
    private LocalDate returnDate;

    @Column(name = "notes", length = 500)
    private String notes;

    @Column(name = "compensation_amount", precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal compensationAmount = BigDecimal.ZERO;
}
