package com.forher.erp_backend.controller;

import com.forher.erp_backend.entity.Category;
import com.forher.erp_backend.service.Interface.ICategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/sales/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final ICategoryService categoryService;

    @GetMapping
    public ResponseEntity<?> getAll() { return ResponseEntity.ok(categoryService.getAllCategories()); }

    @GetMapping("/{id}")
    public ResponseEntity<?> getById(@PathVariable String id) {
        try { return ResponseEntity.ok(categoryService.getCategoryById(id)); }
        catch (RuntimeException e) { return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage()); }
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody Category category) {
        return ResponseEntity.status(HttpStatus.CREATED).body(categoryService.createCategory(category));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable String id, @RequestBody Category details) {
        try { return ResponseEntity.ok(categoryService.updateCategory(id, details)); }
        catch (RuntimeException e) { return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage()); }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable String id) {
        try { categoryService.deleteCategory(id); return ResponseEntity.ok("Đã xóa danh mục."); }
        catch (RuntimeException e) { return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage()); }
    }
}
