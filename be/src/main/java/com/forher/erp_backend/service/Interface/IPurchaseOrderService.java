package com.forher.erp_backend.service.Interface;

import com.forher.erp_backend.entity.PurchaseOrder;

import java.util.List;

public interface IPurchaseOrderService {
    List<PurchaseOrder> getAllPurchaseOrders();
    PurchaseOrder getPurchaseOrderById(String id);
    PurchaseOrder createPurchaseOrder(PurchaseOrder purchaseOrder);
    PurchaseOrder updatePurchaseOrder(String id, PurchaseOrder purchaseOrderDetails);
    void deletePurchaseOrder(String id);

    // Nghiệp vụ Nhập hàng
    void receiveGoods(String poId); // Xác nhận đã nhận hàng -> Tự động cộng số lượng vào INVENTORY
}