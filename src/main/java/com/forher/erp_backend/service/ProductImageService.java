package com.forher.erp_backend.service;

import com.forher.erp_backend.entity.Product;
import com.forher.erp_backend.entity.ProductImage;
import com.forher.erp_backend.repository.ProductImageRepository;
import com.forher.erp_backend.repository.ProductRepository;
import com.forher.erp_backend.service.Interface.IProductImageService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductImageService implements IProductImageService {

    private final ProductImageRepository productImageRepository;
    private final ProductRepository productRepository; // Cần gọi Repository của Product để kiểm tra

    @Override
    public List<ProductImage> getAllImages() {
        return productImageRepository.findAll();
    }

    @Override
    public ProductImage getImageById(Long id) {
        return productImageRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy hình ảnh với ID: " + id));
    }

    @Override
    @Transactional
    public ProductImage addImageToProduct(String productId, ProductImage image) {
        // Phải chắc chắn sản phẩm tồn tại thì mới cho thêm ảnh
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy sản phẩm với ID: " + productId));

        image.setProduct(product);
        return productImageRepository.save(image);
    }

    @Override
    @Transactional
    public void deleteImage(Long id) {
        ProductImage image = getImageById(id);
        productImageRepository.delete(image);
    }

    @Override
    public List<ProductImage> getImagesByProductId(String productId) {
        return productImageRepository.findByProductProductId(productId);
    }

    @Override
    @Transactional
    public void setPrimaryImage(Long imageId, String productId) {
        // 1. Tìm tất cả ảnh của sản phẩm này và set isPrimary = false
        List<ProductImage> allImages = getImagesByProductId(productId);
        for (ProductImage img : allImages) {
            img.setIsPrimary(false);
        }
        productImageRepository.saveAll(allImages);

        // 2. Lấy ảnh được chọn và set isPrimary = true
        ProductImage targetImage = getImageById(imageId);
        targetImage.setIsPrimary(true);
        productImageRepository.save(targetImage);
    }
}