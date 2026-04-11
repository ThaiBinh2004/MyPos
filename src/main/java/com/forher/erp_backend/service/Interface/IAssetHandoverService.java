package com.forher.erp_backend.service.Interface;

import com.forher.erp_backend.entity.AssetHandover;
import java.util.List;

public interface IAssetHandoverService {
    // Nghiệp vụ: Tạo biên bản thu hồi tài sản khi NV nghỉ việc
    void createRevokeHandover(String employeeId);
}