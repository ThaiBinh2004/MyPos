package com.forher.erp_backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Entity
@Table(name = "PRODUCT")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Product {

    @Id
    @Column(name = "product_id", length = 20)
    private String productId;

    @Column(name = "product_name", length = 200, nullable = false)
    private String productName;

    @Column(name = "sku", length = 50, nullable = false, unique = true)
    private String sku;

    @Column(name = "price", precision = 15, scale = 2, nullable = false)
    private BigDecimal price; // Dùng BigDecimal cho tiền tệ (VNĐ)

    @Column(name = "size_info", length = 20)
    private String sizeInfo;

    @Column(name = "color", length = 50)
    private String color;

    @Column(name = "category", length = 100)
    private String category;

    @Column(name = "status", length = 20, nullable = false)
    private String status = "ACTIVE";
}