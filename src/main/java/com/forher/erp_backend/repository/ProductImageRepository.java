package com.forher.erp_backend.repository;

import com.forher.erp_backend.entity.ProductImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductImageRepository extends JpaRepository<ProductImage, Long> {
    // Tìm tất cả hình ảnh của một sản phẩm
    List<ProductImage> findByProductProductId(String productId);
}