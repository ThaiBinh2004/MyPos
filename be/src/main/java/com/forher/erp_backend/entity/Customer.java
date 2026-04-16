package com.forher.erp_backend.entity;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;

@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
@Entity
@Table(name = "CUSTOMER")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Customer {
    @Id
    @Column(name = "customer_id", length = 20)
    private String customerId;

    @Column(name = "full_name", length = 100, nullable = false)
    private String fullName;

    @Column(name = "phone_number", length = 15, nullable = false, unique = true)
    private String phoneNumber;

    @Column(name = "email", length = 150)
    private String email;

    @Column(name = "loyalty_points", nullable = false)
    @Builder.Default
    private Integer loyaltyPoints = 0;

    @Column(name = "customer_rank", length = 20, nullable = false)
    @Builder.Default
    private String customerRank = "Thường";

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}