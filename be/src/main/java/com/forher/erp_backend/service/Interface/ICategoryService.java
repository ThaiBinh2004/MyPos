package com.forher.erp_backend.service.Interface;

import com.forher.erp_backend.entity.Category;
import java.util.List;

public interface ICategoryService {
    List<Category> getAllCategories();
    Category getCategoryById(String id);
    Category createCategory(Category category);
    Category updateCategory(String id, Category categoryDetails);
    void deleteCategory(String id);
}