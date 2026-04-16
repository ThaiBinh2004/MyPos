package com.forher.erp_backend.entity;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.*;
import java.time.LocalDate;

@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
@Entity
@Table(name = "PURCHASE_ORDER")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class PurchaseOrder {
    @Id
    @Column(name = "po_id", length = 20)
    private String poId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "supplier_id", nullable = false)
    private Supplier supplier;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "branch_id", nullable = false)
    private Branch branch;

    @Column(name = "order_date", nullable = false)
    private LocalDate orderDate;

    @Column(name = "status", length = 30, nullable = false)
    private String status;

    @Column(name = "note", length = 500)
    private String note;
}