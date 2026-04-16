package com.forher.erp_backend.entity;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
@Entity
@Table(name = "ORDERS")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Orders {

    @Id
    @Column(name = "order_id", length = 30)
    private String orderId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id")
    private Customer customer; // Có thể NULL nếu khách vãng lai

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "branch_id", nullable = false)
    private Branch branch;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id")
    private Employee employee;

    @Column(name = "order_type", length = 10, nullable = false)
    private String orderType; // OFFLINE hoặc ONLINE

    @Column(name = "total_amount", precision = 15, scale = 2, nullable = false)
    private BigDecimal totalAmount;

    @Column(name = "payment_method", length = 30, nullable = false)
    private String paymentMethod;

    @Column(name = "shipping_address", length = 255)
    private String shippingAddress;

    @Column(name = "status", length = 30, nullable = false)
    private String status;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}