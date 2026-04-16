package com.forher.erp_backend.dto;

import com.forher.erp_backend.entity.Candidate;
import java.time.LocalDateTime;

public record CandidateResponse(
        String candidateId,
        String fullName,
        String email,
        String phoneNumber,
        String appliedPosition,
        String source,
        String status,
        String offerStatus,
        String employeeId,
        LocalDateTime createdAt
) {
    public static CandidateResponse from(Candidate c) {
        return new CandidateResponse(
                c.getCandidateId(),
                c.getFullName(),
                c.getEmail(),
                c.getPhoneNumber(),
                c.getAppliedPosition(),
                c.getSource(),
                c.getStatus(),
                c.getOfferStatus(),
                c.getEmployee() != null ? c.getEmployee().getEmployeeId() : null,
                c.getCreatedAt()
        );
    }
}
