package com.forher.erp_backend.service.Interface;

import com.forher.erp_backend.entity.UserAccount;
import java.util.List;

public interface IUserAccountService {
    List<UserAccount> getAllAccounts();
    UserAccount getAccountById(String id);
    UserAccount createAccount(UserAccount account);
    UserAccount updateAccount(String id, UserAccount accountDetails);
    void deleteAccount(String id);

    // Nghiệp vụ: Đổi mật khẩu
    void changePassword(String accountId, String oldPassword, String newPassword);

    // Nghiệp vụ: Khóa/Mở khóa tài khoản
    void toggleAccountStatus(String accountId, boolean isActive);
}