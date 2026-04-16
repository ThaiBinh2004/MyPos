package com.forher.erp_backend.dto;

import java.util.List;

public record PaginatedResponse<T>(List<T> data, long total, int page, int pageSize) {
    public static <T> PaginatedResponse<T> of(List<T> items) {
        return new PaginatedResponse<>(items, items.size(), 1, items.size() == 0 ? 10 : items.size());
    }
}
