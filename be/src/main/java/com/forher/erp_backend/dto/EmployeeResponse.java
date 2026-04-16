package com.forher.erp_backend.dto;

import com.forher.erp_backend.entity.Employee;
import java.time.LocalDate;
import java.time.LocalDateTime;

public record EmployeeResponse(
        String employeeId,
        String fullName,
        LocalDate dateOfBirth,
        String gender,
        String idCard,
        String email,
        String phoneNumber,
        String address,
        String bankAccount,
        String position,
        String department,
        String defaultShift,
        String status,
        String branchId,
        String branchName,
        LocalDateTime createdAt
) {
    public static EmployeeResponse from(Employee e) {
        return new EmployeeResponse(
                e.getEmployeeId(),
                e.getFullName(),
                e.getDateOfBirth(),
                e.getGender(),
                e.getIdCard(),
                e.getEmail(),
                e.getPhoneNumber(),
                e.getAddress(),
                e.getBankAccount(),
                e.getPosition(),
                e.getDepartment(),
                e.getDefaultShift(),
                e.getStatus(),
                e.getBranch() != null ? e.getBranch().getBranchId() : null,
                e.getBranch() != null ? e.getBranch().getBranchName() : null,
                e.getCreatedAt()
        );
    }
}
