package com.forher.erp_backend.dto;

public record LoginResponse(String token, AuthUserResponse user) {}
