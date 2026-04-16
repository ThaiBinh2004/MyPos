package com.forher.erp_backend.service.Interface;

import com.forher.erp_backend.entity.Product;
import java.util.List;

public interface IProductService {
    List<Product> getAllProducts();
    Product getProductById(String id);
    Product createProduct(Product product);
    Product updateProduct(String id, Product productDetails);
    void deleteProduct(String id);

    List<Product> getProductsByCategory(String categoryName);
}