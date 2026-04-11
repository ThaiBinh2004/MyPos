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
        existing.setProductName(productDetails.getProductName());
        existing.setPrice(productDetails.getPrice());
        existing.setSizeInfo(productDetails.getSizeInfo());
        existing.setColor(productDetails.getColor());
        existing.setCategory(productDetails.getCategory());
        existing.setStatus(productDetails.getStatus());
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
    public List<Product> getProductsByCategory(String categoryName) {
        return productRepository.findAll().stream()
                .filter(p -> p.getCategory() != null && p.getCategory().equalsIgnoreCase(categoryName))
                .collect(Collectors.toList());
    }
}