package com.forher.erp_backend.service;

import com.forher.erp_backend.entity.UserAccount;
import com.forher.erp_backend.repository.UserAccountRepository;
import com.forher.erp_backend.service.Interface.IUserAccountService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserAccountService implements IUserAccountService {

    private final UserAccountRepository userAccountRepository;

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
        // Kiểm tra xem username đã tồn tại chưa
        if (userAccountRepository.findByUsername(account.getUsername()).isPresent()) {
            throw new RuntimeException("Tên đăng nhập đã tồn tại: " + account.getUsername());
        }
        // Ở thực tế, chỗ này sẽ phải mã hóa password (ví dụ dùng BCrypt) trước khi lưu
        return userAccountRepository.save(account);
    }

    @Override
    @Transactional
    public UserAccount updateAccount(String id, UserAccount accountDetails) {
        UserAccount existingAccount = getAccountById(id);

        existingAccount.setRole(accountDetails.getRole());
        existingAccount.setIsActive(accountDetails.getIsActive());
        // Thường thì username không được phép đổi, chỉ đổi role hoặc trạng thái

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

        // So sánh mật khẩu cũ (sau này dùng PasswordEncoder)
        if (!account.getPassword().equals(oldPassword)) {
            throw new RuntimeException("Mật khẩu cũ không chính xác!");
        }

        account.setPassword(newPassword); // Set mật khẩu mới
        userAccountRepository.save(account);
    }

    @Override
    @Transactional
    public void toggleAccountStatus(String accountId, boolean isActive) {
        UserAccount account = getAccountById(accountId);
        account.setIsActive(isActive);
        userAccountRepository.save(account);
    }
}