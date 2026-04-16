package com.forher.erp_backend.dto;

import com.forher.erp_backend.entity.RecruitmentRequest;
import java.time.LocalDateTime;

public record RecruitmentRequestResponse(
        String requestId,
        String position,
        Integer quantity,
        String description,
        String status,
        String createdBy,
        String createdByName,
        LocalDateTime createdAt
) {
    public static RecruitmentRequestResponse from(RecruitmentRequest r) {
        return new RecruitmentRequestResponse(
                r.getRequestId(),
                r.getPosition(),
                r.getQuantity(),
                r.getDescription(),
                r.getStatus(),
                r.getCreatedBy() != null ? r.getCreatedBy().getEmployeeId() : null,
                r.getCreatedBy() != null ? r.getCreatedBy().getFullName() : null,
                r.getCreatedAt()
        );
    }
}
