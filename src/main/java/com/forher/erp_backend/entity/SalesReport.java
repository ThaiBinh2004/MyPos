package com.forher.erp_backend.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "SALES_REPORT")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class SalesReport {
    @Id
    @Column(name = "report_id", length = 30)
    private String reportId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "branch_id", nullable = false)
    private Branch branch;

    @Column(name = "period_type", length = 20, nullable = false)
    private String periodType;

    @Column(name = "from_date", nullable = false)
    private LocalDate fromDate;

    @Column(name = "to_date", nullable = false)
    private LocalDate toDate;

    @Column(name = "total_revenue", precision = 18, scale = 2, nullable = false)
    private BigDecimal totalRevenue;

    @Column(name = "total_orders", nullable = false)
    private Integer totalOrders = 0;

    @CreationTimestamp
    @Column(name = "generated_at", nullable = false, updatable = false)
    private LocalDateTime generatedAt;
}