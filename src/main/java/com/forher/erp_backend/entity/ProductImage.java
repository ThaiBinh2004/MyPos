package com.forher.erp_backend.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "PRODUCT_IMAGE")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ProductImage {

    // Với bảng chứa nhiều dữ liệu phụ như hình ảnh, nên dùng Long tự tăng cho nhẹ DB
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long imageId;

    @Column(name = "image_url", length = 500, nullable = false)
    private String imageUrl;

    @Column(name = "is_primary")
    private Boolean isPrimary; // true nếu đây là ảnh đại diện (thumbnail) của sản phẩm

    // Mối quan hệ N-1: 1 Sản phẩm có nhiều Hình ảnh
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;
}