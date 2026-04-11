package com.forher.erp_backend.service.Interface;

import com.forher.erp_backend.entity.Asset;
import java.util.List;

public interface IAssetService {
    List<Asset> getAllAssets();
    Asset getAssetById(String id);
    Asset createAsset(Asset asset);
    Asset updateAsset(String id, Asset assetDetails);
    void deleteAsset(String id);

    void updateAssetCondition(String assetId, String newCondition);
}