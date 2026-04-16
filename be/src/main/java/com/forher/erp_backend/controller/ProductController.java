package com.forher.erp_backend.controller;

import com.forher.erp_backend.dto.PaginatedResponse;
import com.forher.erp_backend.dto.ProductResponse;
import com.forher.erp_backend.entity.Product;
import com.forher.erp_backend.service.Interface.IProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/sales/products")
@RequiredArgsConstructor
public class ProductController {

    private final IProductService productService;

    @GetMapping
    public ResponseEntity<?> getAll() {
        return ResponseEntity.ok(PaginatedResponse.of(
                productService.getAllProducts().stream().map(ProductResponse::from).toList()
        ));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getById(@PathVariable String id) {
        try { return ResponseEntity.ok(ProductResponse.from(productService.getProductById(id))); }
        catch (RuntimeException e) { return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage()); }
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody Product product) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ProductResponse.from(productService.createProduct(product)));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable String id, @RequestBody Product details) {
        try { return ResponseEntity.ok(ProductResponse.from(productService.updateProduct(id, details))); }
        catch (RuntimeException e) { return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage()); }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable String id) {
        try { productService.deleteProduct(id); return ResponseEntity.ok("Đã xóa sản phẩm."); }
        catch (RuntimeException e) { return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage()); }
    }
}
