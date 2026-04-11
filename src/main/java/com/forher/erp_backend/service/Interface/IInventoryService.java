package com.forher.erp_backend.service.Interface;
import com.forher.erp_backend.entity.Inventory;
import java.util.List;

public interface IInventoryService {
    // Nghiệp vụ Cốt lõi Kho
    void updateStock(String productId, String branchId, int quantityChange);
    boolean checkAvailability(String productId, String branchId, int requiredQuantity);

    // Nghiệp vụ: Cảnh báo hàng sắp hết (dưới mức min_threshold)
    List<Object> getLowStockAlerts(String branchId);
}