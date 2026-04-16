package com.forher.erp_backend.controller;

import com.forher.erp_backend.dto.AuthUserResponse;
import com.forher.erp_backend.dto.LoginRequest;
import com.forher.erp_backend.dto.LoginResponse;
import com.forher.erp_backend.entity.UserAccount;
import com.forher.erp_backend.repository.UserAccountRepository;
import com.forher.erp_backend.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;
    private final UserAccountRepository userAccountRepository;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.username(), request.password()));
            UserAccount account = userAccountRepository.findByUsername(request.username())
                    .orElseThrow(() -> new RuntimeException("Tài khoản không tồn tại"));
            String token = jwtUtil.generateToken(account.getUsername(), account.getRole());
            return ResponseEntity.ok(new LoginResponse(token, AuthUserResponse.from(account)));
        } catch (BadCredentialsException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Sai tên đăng nhập hoặc mật khẩu!");
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout() {
        return ResponseEntity.ok(Map.of("message", "Đăng xuất thành công"));
    }

    @GetMapping("/me")
    public ResponseEntity<?> me(@AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        UserAccount account = userAccountRepository.findByUsername(userDetails.getUsername())
                .orElse(null);
        if (account == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        return ResponseEntity.ok(AuthUserResponse.from(account));
    }
}
