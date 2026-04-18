package com.forher.erp_backend.service;

import com.forher.erp_backend.entity.Product;
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
        // Có thể thêm logic kiểm tra trùng SKU ở đây (dù DB đã có unique)
        return productRepository.save(product);
    }

    @Override
    @Transactional
    public Product updateProduct(String id, Product productDetails) {
        Product existing = getProductById(id);
        if (productDetails.getProductName() != null) existing.setProductName(productDetails.getProductName());
        if (productDetails.getPrice() != null) existing.setPrice(productDetails.getPrice());
        if (productDetails.getSizeInfo() != null) existing.setSizeInfo(productDetails.getSizeInfo());
        if (productDetails.getColor() != null) existing.setColor(productDetails.getColor());
        if (productDetails.getImageUrl() != null) existing.setImageUrl(productDetails.getImageUrl());
        if (productDetails.getCategory() != null) existing.setCategory(productDetails.getCategory());
        if (productDetails.getStatus() != null) existing.setStatus(productDetails.getStatus());
        return productRepository.save(existing);
    }

    @Override
    @Transactional
    public void deleteProduct(String id) {
        Product existing = getProductById(id);
        existing.setStatus("INACTIVE"); // Xóa mềm
        productRepository.save(existing);
    }

    // NGHIỆP VỤ: Lấy sản phẩm theo Category
    @Override
    public List<Product> getProductsByCategory(String categoryId) {
        return productRepository.findAll().stream()
                .filter(p -> p.getCategory() != null && p.getCategory().getCategoryId().equals(categoryId))
                .collect(Collectors.toList());
    }
}