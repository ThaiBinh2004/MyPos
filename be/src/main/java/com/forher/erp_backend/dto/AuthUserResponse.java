package com.forher.erp_backend.dto;

import com.forher.erp_backend.entity.UserAccount;

public record AuthUserResponse(
        String employeeId,
        String fullName,
        String role,
        String branchId,
        String branchName
) {
    public static AuthUserResponse from(UserAccount account) {
        String employeeId = null, fullName = null, branchId = null, branchName = null;
        if (account.getEmployee() != null) {
            employeeId = account.getEmployee().getEmployeeId();
            fullName = account.getEmployee().getFullName();
            if (account.getEmployee().getBranch() != null) {
                branchId = account.getEmployee().getBranch().getBranchId();
                branchName = account.getEmployee().getBranch().getBranchName();
            }
        }
        return new AuthUserResponse(employeeId, fullName, account.getRole(), branchId, branchName);
    }
}
