package com.forher.erp_backend.entity;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.*;
import org.hibernate.annotations.UpdateTimestamp;
import java.time.LocalDateTime;

@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
@Entity
@Table(name = "INVENTORY")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Inventory {
    @Id
    @Column(name = "inventory_id", length = 20)
    private String inventoryId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "branch_id", nullable = false)
    private Branch branch;

    @Column(name = "quantity", nullable = false)
    @Builder.Default
    private Integer quantity = 0;

    @Column(name = "min_threshold", nullable = false)
    @Builder.Default
    private Integer minThreshold = 5;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
}