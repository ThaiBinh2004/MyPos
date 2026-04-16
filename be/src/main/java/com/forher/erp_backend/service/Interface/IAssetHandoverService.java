package com.forher.erp_backend.service.Interface;
import com.forher.erp_backend.entity.AssetHandover;
import java.util.List;

public interface IAssetHandoverService {
    List<AssetHandover> getAllHandovers();
    AssetHandover createHandover(AssetHandover handover);
    void createRevokeHandover(String employeeId);
}
