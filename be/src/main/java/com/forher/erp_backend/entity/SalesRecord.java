package com.forher.erp_backend.entity;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
@Entity
@Table(name = "SALES_RECORD")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class SalesRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    @Column(name = "shift_date", nullable = false)
    private LocalDate shiftDate;

    @Column(name = "shift", length = 20)
    private String shift; // CA_SANG / CA_TOI / HANH_CHINH

    @Column(name = "sales_amount", precision = 15, scale = 0)
    private BigDecimal salesAmount;

    @Column(name = "product_count")
    @Builder.Default
    private Integer productCount = 0;

    @Column(name = "month", length = 7, nullable = false) // "YYYY-MM"
    private String month;

    @Column(name = "imported_by", length = 100)
    private String importedBy;

    @Column(name = "imported_at")
    private LocalDateTime importedAt;
}
