package com.forher.erp_backend.service.Interface;

import com.forher.erp_backend.entity.PurchaseOrderDetail;
import java.util.List;

public interface IPurchaseOrderDetailService {
    List<PurchaseOrderDetail> getAllPurchaseOrderDetails();
    PurchaseOrderDetail getPurchaseOrderDetailById(String id);
    PurchaseOrderDetail createPurchaseOrderDetail(PurchaseOrderDetail detail);
    PurchaseOrderDetail updatePurchaseOrderDetail(String id, PurchaseOrderDetail detail);
    void deletePurchaseOrderDetail(String id);

    // Nghiệp vụ: Xem chi tiết 1 phiếu nhập
    List<PurchaseOrderDetail> getDetailsByPoId(String poId);
}