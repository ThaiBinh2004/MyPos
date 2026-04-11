package com.forher.erp_backend.controller;

import com.forher.erp_backend.entity.ProductImage;
import com.forher.erp_backend.service.Interface.IProductImageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/product-images")
@RequiredArgsConstructor
public class ProductImageController {

    private final IProductImageService productImageService;

    @GetMapping
    public ResponseEntity<?> getAllImages() {
        try {
            return ResponseEntity.ok(productImageService.getAllImages());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Lỗi server: " + e.getMessage());
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getImageById(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(productImageService.getImageById(id));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Lỗi server: " + e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteImage(@PathVariable Long id) {
        try {
            productImageService.deleteImage(id);
            return ResponseEntity.ok("Xóa hình ảnh thành công!");
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Lỗi server: " + e.getMessage());
        }
    }

    // --- API NGHIỆP VỤ ---

    // 1. Lấy tất cả ảnh của 1 sản phẩm
    @GetMapping("/product/{productId}")
    public ResponseEntity<?> getImagesByProduct(@PathVariable String productId) {
        try {
            return ResponseEntity.ok(productImageService.getImagesByProductId(productId));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Lỗi server: " + e.getMessage());
        }
    }

    // 2. Thêm ảnh mới cho 1 sản phẩm
    // Ví dụ gọi: POST /api/v1/product-images/product/PROD01
    @PostMapping("/product/{productId}")
    public ResponseEntity<?> addImageToProduct(@PathVariable String productId, @RequestBody ProductImage image) {
        try {
            return ResponseEntity.status(HttpStatus.CREATED).body(productImageService.addImageToProduct(productId, image));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Lỗi server: " + e.getMessage());
        }
    }

    // 3. Set một ảnh làm ảnh đại diện (Primary)
    // Ví dụ gọi: PATCH /api/v1/product-images/1/primary?productId=PROD01
    @PatchMapping("/{imageId}/primary")
    public ResponseEntity<?> setPrimaryImage(@PathVariable Long imageId, @RequestParam String productId) {
        try {
            productImageService.setPrimaryImage(imageId, productId);
            return ResponseEntity.ok("Đã thiết lập ảnh đại diện thành công!");
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Lỗi server: " + e.getMessage());
        }
    }
}