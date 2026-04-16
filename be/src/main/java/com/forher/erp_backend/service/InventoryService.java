package com.forher.erp_backend.service;

import com.forher.erp_backend.entity.Inventory;
import com.forher.erp_backend.repository.InventoryRepository;
import com.forher.erp_backend.service.Interface.IInventoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class InventoryService implements IInventoryService {

    private final InventoryRepository inventoryRepository;

    @Override
    public List<Inventory> getAllInventory() {
        return inventoryRepository.findAll();
    }

    // Hàm phụ trợ tìm đúng dòng tồn kho của 1 SP tại 1 Chi nhánh
    private Inventory findExactInventory(String productId, String branchId) {
        return inventoryRepository.findAll().stream()
                .filter(i -> i.getProduct().getProductId().equals(productId)
                        && i.getBranch().getBranchId().equals(branchId))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Sản phẩm chưa được khởi tạo tồn kho tại chi nhánh này!"));
    }

    @Override
    @Transactional
    public void updateStock(String productId, String branchId, int quantityChange) {
        Inventory inventory = findExactInventory(productId, branchId);

        int newQuantity = inventory.getQuantity() + quantityChange;

        if (newQuantity < 0) {
            throw new RuntimeException("Kho không đủ hàng! Số lượng hiện tại: " + inventory.getQuantity());
        }

        inventory.setQuantity(newQuantity);
        inventoryRepository.save(inventory);
    }

    @Override
    public boolean checkAvailability(String productId, String branchId, int requiredQuantity) {
        try {
            Inventory inventory = findExactInventory(productId, branchId);
            return inventory.getQuantity() >= requiredQuantity;
        } catch (Exception e) {
            return false; // Không tìm thấy tồn kho coi như hết hàng
        }
    }

    @Override
    public List<Inventory> getLowStockAlerts(String branchId) {
        return inventoryRepository.findAll().stream()
                .filter(i -> i.getBranch().getBranchId().equals(branchId)
                        && i.getQuantity() < i.getMinThreshold())
                .collect(Collectors.toList());
    }
}