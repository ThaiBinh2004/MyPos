package com.forher.erp_backend.service.Interface;

import com.forher.erp_backend.entity.ProductImage;
import java.util.List;

public interface IProductImageService {
    List<ProductImage> getAllImages();
    ProductImage getImageById(Long id);
    ProductImage addImageToProduct(String productId, ProductImage image);
    void deleteImage(Long id);

    // Nghiệp vụ: Lấy danh sách ảnh của 1 sản phẩm cụ thể
    List<ProductImage> getImagesByProductId(String productId);

    // Nghiệp vụ: Đặt một ảnh làm ảnh đại diện chính
    void setPrimaryImage(Long imageId, String productId);
}