package com.forher.erp_backend.controller;

import com.forher.erp_backend.entity.Product;
import com.forher.erp_backend.service.Interface.IProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/products")
@RequiredArgsConstructor
public class ProductController {

    private final IProductService productService;

    // NGHIỆP VỤ: Xem toàn bộ danh sách sản phẩm
    // Mở cho toàn bộ nhân sự để phục vụ bán hàng
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'EMPLOYEE')")
    @GetMapping
    public ResponseEntity<?> getAll() { return ResponseEntity.ok(productService.getAllProducts()); }

    // NGHIỆP VỤ: Xem chi tiết 1 sản phẩm
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'EMPLOYEE')")
    @GetMapping("/{id}")
    public ResponseEntity<?> getById(@PathVariable String id) {
        try { return ResponseEntity.ok(productService.getProductById(id)); }
        catch (RuntimeException e) { return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage()); }
    }

    // NGHIỆP VỤ: Lấy sản phẩm theo danh mục
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'EMPLOYEE')")
    @GetMapping("/category/{categoryName}")
    public ResponseEntity<?> getByCategory(@PathVariable String categoryName) {
        return ResponseEntity.ok(productService.getProductsByCategory(categoryName));
    }

    // NGHIỆP VỤ: Thêm sản phẩm mới vào hệ thống
    // CHỈ ADMIN và MANAGER được phép thực hiện
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @PostMapping
    public ResponseEntity<?> create(@RequestBody Product product) {
        return ResponseEntity.status(HttpStatus.CREATED).body(productService.createProduct(product));
    }

    // NGHIỆP VỤ: Cập nhật thông tin, giá bán sản phẩm
    // CHỈ ADMIN và MANAGER được phép sửa đổi
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable String id, @RequestBody Product details) {
        return ResponseEntity.ok(productService.updateProduct(id, details));
    }

    // NGHIỆP VỤ: Ngừng kinh doanh sản phẩm
    // CHỈ ADMIN và MANAGER có quyền xóa/ngừng bán
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable String id) {
        productService.deleteProduct(id);
        return ResponseEntity.ok("Đã đánh dấu ngừng bán sản phẩm.");
    }
}