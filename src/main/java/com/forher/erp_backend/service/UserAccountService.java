package com.forher.erp_backend.service;

import com.forher.erp_backend.entity.UserAccount;
import com.forher.erp_backend.repository.UserAccountRepository;
import com.forher.erp_backend.service.Interface.IUserAccountService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserAccountService implements IUserAccountService {

    private final UserAccountRepository userAccountRepository;
    private final PasswordEncoder passwordEncoder; // Thêm công cụ mã hóa của Spring Security

    @Override
    public List<UserAccount> getAllAccounts() {
        return userAccountRepository.findAll();
    }

    @Override
    public UserAccount getAccountById(String id) {
        return userAccountRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy tài khoản với ID: " + id));
    }

    @Override
    @Transactional
    public UserAccount createAccount(UserAccount account) {
        // Mặc dù đã có Register ở AuthService, nhưng Admin vẫn có thể tạo tay ở đây
        // Phải mã hóa mật khẩu trước khi lưu
        account.setPassword(passwordEncoder.encode(account.getPassword()));

        if (account.getIsActive() == null) {
            account.setIsActive(1); // Mặc định là mở khóa
        }
        return userAccountRepository.save(account);
    }

    @Override
    @Transactional
    public UserAccount updateAccount(String id, UserAccount accountDetails) {
        UserAccount existingAccount = getAccountById(id);

        existingAccount.setRole(accountDetails.getRole());
        existingAccount.setIsActive(accountDetails.getIsActive());

        return userAccountRepository.save(existingAccount);
    }

    @Override
    @Transactional
    public void deleteAccount(String id) {
        UserAccount existingAccount = getAccountById(id);
        userAccountRepository.delete(existingAccount);
    }

    @Override
    @Transactional
    public void changePassword(String accountId, String oldPassword, String newPassword) {
        UserAccount account = getAccountById(accountId);

        // Dùng passwordEncoder.matches để so sánh pass người dùng nhập với chuỗi đã mã hóa trong DB
        if (!passwordEncoder.matches(oldPassword, account.getPassword())) {
            throw new RuntimeException("Mật khẩu cũ không chính xác!");
        }

        // Mã hóa mật khẩu mới rồi mới lưu
        account.setPassword(passwordEncoder.encode(newPassword));
        userAccountRepository.save(account);
    }

    @Override
    @Transactional
    public void toggleAccountStatus(String accountId, Integer isActive) {
        UserAccount account = getAccountById(accountId);
        // isActive: 1 là mở khóa, 0 là khóa
        account.setIsActive(isActive);
        userAccountRepository.save(account);
    }
}