package com.forher.erp_backend.dto.res;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AuthResponse {
    private String token;
    private String username;
    private String role;
    private String employeeId;
    private String message;
}