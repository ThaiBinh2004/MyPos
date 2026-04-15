package com.forher.erp_backend.service;

import com.forher.erp_backend.dto.req.AuthRequest;
import com.forher.erp_backend.dto.res.AuthResponse;
import com.forher.erp_backend.entity.Employee;
import com.forher.erp_backend.entity.UserAccount;
import com.forher.erp_backend.repository.EmployeeRepository;
import com.forher.erp_backend.repository.UserAccountRepository;
import com.forher.erp_backend.security.CustomUserDetailsService;
import com.forher.erp_backend.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserAccountRepository userAccountRepository;
    private final EmployeeRepository employeeRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;
    private final CustomUserDetailsService userDetailsService;

    // NGHIỆP VỤ ĐĂNG KÝ
    @Transactional
    public String register(String username, String rawPassword, String role, String employeeId) {
        if (userAccountRepository.existsById(username)) {
            throw new RuntimeException("Tên đăng nhập đã tồn tại!");
        }

        Employee employee = null;
        if (employeeId != null && !employeeId.trim().isEmpty()) {
            employee = employeeRepository.findById(employeeId)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy Nhân viên mã: " + employeeId));
        }

        // Mã hóa mật khẩu bằng BCrypt
        UserAccount newAccount = UserAccount.builder()
                .accountId("ACC_" + System.currentTimeMillis())
                .username(username)
                .password(passwordEncoder.encode(rawPassword))
                .role(role != null ? role : "EMPLOYEE")
                .isActive(1)
                .employee(employee)
                .build();

        userAccountRepository.save(newAccount);
        return "Đăng ký tài khoản thành công cho user: " + username;
    }

    // NGHIỆP VỤ ĐĂNG NHẬP
    public AuthResponse login(AuthRequest request) {
        // 1. Spring Security tự động kiểm tra user/pass với DB (Sai sẽ văng lỗi ngay)
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
        );

        // 2. Nếu đúng pass, lấy thông tin User lên
        UserAccount account = userAccountRepository.findById(request.getUsername())
                .orElseThrow(() -> new RuntimeException("Lỗi truy xuất tài khoản"));

        UserDetails userDetails = userDetailsService.loadUserByUsername(request.getUsername());

        // 3. Máy dập Token hoạt động
        String jwtToken = jwtUtil.generateToken(userDetails);

        // 4. Đóng gói trả về cho Frontend
        return AuthResponse.builder()
                .token(jwtToken)
                .username(account.getUsername())
                .role(account.getRole())
                .employeeId(account.getEmployee() != null ? account.getEmployee().getEmployeeId() : null)
                .message("Đăng nhập thành công!")
                .build();
    }
}