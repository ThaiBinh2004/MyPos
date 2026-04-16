package com.forher.erp_backend.security;

import com.forher.erp_backend.entity.UserAccount;
import com.forher.erp_backend.repository.UserAccountRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.*;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UserAccountRepository userAccountRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        UserAccount account = userAccountRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("Không tìm thấy tài khoản: " + username));

        return new org.springframework.security.core.userdetails.User(
                account.getUsername(),
                account.getPassword(),
                Boolean.TRUE.equals(account.getIsActive()),
                true, true, true,
                List.of(new SimpleGrantedAuthority("ROLE_" + account.getRole()))
        );
    }
}
