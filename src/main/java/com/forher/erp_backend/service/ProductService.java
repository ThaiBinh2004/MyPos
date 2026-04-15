package com.forher.erp_backend.service;

import com.forher.erp_backend.entity.Category;
import com.forher.erp_backend.entity.Product;
import com.forher.erp_backend.repository.CategoryRepository;
import com.forher.erp_backend.repository.ProductRepository;
import com.forher.erp_backend.service.Interface.IProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductService implements IProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository; // Cần thêm để check danh mục

    @Override
    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    @Override
    public Product getProductById(String id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy sản phẩm mã: " + id));
    }

    @Override
    @Transactional
    public Product createProduct(Product product) {
        // Kiểm tra xem Category có hợp lệ không trước khi lưu
        if (product.getCategory() != null && product.getCategory().getCategoryId() != null) {
            Category category = categoryRepository.findById(product.getCategory().getCategoryId())
                    .orElseThrow(() -> new RuntimeException("Danh mục không tồn tại!"));
            product.setCategory(category);
        }

        if (product.getStatus() == null) {
            product.setStatus("ACTIVE");
        }
        return productRepository.save(product);
    }

    @Override
    @Transactional
    public Product updateProduct(String id, Product details) {
        Product existing = getProductById(id);

        existing.setProductName(details.getProductName());
        existing.setPrice(details.getPrice());
        existing.setSizeInfo(details.getSizeInfo());
        existing.setColor(details.getColor());
        existing.setImageUrl(details.getImageUrl());

        // Cập nhật lại danh mục nếu có thay đổi
        if (details.getCategory() != null && details.getCategory().getCategoryId() != null) {
            Category category = categoryRepository.findById(details.getCategory().getCategoryId())
                    .orElseThrow(() -> new RuntimeException("Danh mục không tồn tại!"));
            existing.setCategory(category);
        } else {
            existing.setCategory(null);
        }

        existing.setStatus(details.getStatus());

        return productRepository.save(existing);
    }

    @Override
    @Transactional
    public void deleteProduct(String id) {
        Product existing = getProductById(id);
        existing.setStatus("INACTIVE");
        productRepository.save(existing);
    }

    @Override
    public List<Product> getProductsByCategory(String categoryName) {
        return productRepository.findAll().stream()
                .filter(p -> p.getCategory() != null
                        && p.getCategory().getCategoryName() != null
                        && p.getCategory().getCategoryName().equalsIgnoreCase(categoryName))
                .collect(Collectors.toList());
    }
}