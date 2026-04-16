package com.forher.erp_backend.entity;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.*;
import java.math.BigDecimal;

@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
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
    private BigDecimal price;

    @Column(name = "size_info", length = 20)
    private String sizeInfo;

    @Column(name = "color", length = 50)
    private String color;

    @Column(name = "image_url", length = 500)
    private String imageUrl;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;

    @Column(name = "status", length = 20, nullable = false)
    @Builder.Default
    private String status = "ACTIVE";
}