package com.forher.erp_backend.service;

import com.forher.erp_backend.entity.Asset;
import com.forher.erp_backend.repository.AssetRepository;
import com.forher.erp_backend.service.Interface.IAssetService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AssetService implements IAssetService {

    private final AssetRepository assetRepository;

    @Override
    public List<Asset> getAllAssets() { return assetRepository.findAll(); }

    @Override
    public Asset getAssetById(String id) {
        return assetRepository.findById(id).orElseThrow(() -> new RuntimeException("Không tìm thấy tài sản!"));
    }

    @Override
    @Transactional
    public Asset createAsset(Asset asset) {
        if(asset.getAssetCondition() == null) asset.setAssetCondition("TỐT");
        return assetRepository.save(asset);
    }

    @Override
    @Transactional
    public Asset updateAsset(String id, Asset details) {
        Asset existing = getAssetById(id);
        existing.setAssetName(details.getAssetName());
        existing.setAssetType(details.getAssetType());
        existing.setAssetValue(details.getAssetValue());
        existing.setEmployee(details.getEmployee());
        existing.setHandoverDate(details.getHandoverDate());
        return assetRepository.save(existing);
    }

    @Override
    @Transactional
    public void deleteAsset(String id) { assetRepository.deleteById(id); }

    @Override
    @Transactional
    public void updateAssetCondition(String assetId, String newCondition) {
        Asset existing = getAssetById(assetId);
        existing.setAssetCondition(newCondition);
        assetRepository.save(existing);
    }
}