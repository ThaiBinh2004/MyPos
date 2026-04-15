package com.forher.erp_backend.dto.req;

import lombok.Data;

@Data
public class AuthRequest {
    private String username;
    private String password;
}