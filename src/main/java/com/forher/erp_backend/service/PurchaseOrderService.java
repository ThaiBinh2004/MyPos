package com.forher.erp_backend.service;

import com.forher.erp_backend.entity.PurchaseOrder;
import com.forher.erp_backend.entity.PurchaseOrderDetail;
import com.forher.erp_backend.repository.PurchaseOrderRepository;
import com.forher.erp_backend.service.Interface.IInventoryService;
import com.forher.erp_backend.service.Interface.IPurchaseOrderDetailService;
import com.forher.erp_backend.service.Interface.IPurchaseOrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PurchaseOrderService implements IPurchaseOrderService {

    private final PurchaseOrderRepository purchaseOrderRepository;
    private final IPurchaseOrderDetailService poDetailService;
    private final IInventoryService inventoryService;

    @Override
    public List<PurchaseOrder> getAllPurchaseOrders() {
        return purchaseOrderRepository.findAll();
    }

    @Override
    public PurchaseOrder getPurchaseOrderById(String id) {
        return purchaseOrderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy Phiếu nhập kho mã: " + id));
    }

    @Override
    @Transactional
    public PurchaseOrder createPurchaseOrder(PurchaseOrder purchaseOrder) {
        purchaseOrder.setStatus("PENDING"); // Chờ giao hàng
        return purchaseOrderRepository.save(purchaseOrder);
    }

    @Override
    @Transactional
    public PurchaseOrder updatePurchaseOrder(String id, PurchaseOrder purchaseOrderDetails) {
        PurchaseOrder existing = getPurchaseOrderById(id);
        existing.setNote(purchaseOrderDetails.getNote());
        existing.setStatus(purchaseOrderDetails.getStatus());
        return purchaseOrderRepository.save(existing);
    }

    @Override
    @Transactional
    public void deletePurchaseOrder(String id) {
        purchaseOrderRepository.deleteById(id);
    }

    // NGHIỆP VỤ NHẬP KHO: Xác nhận đã nhận hàng -> Tự động cộng tồn kho
    @Override
    @Transactional
    public void receiveGoods(String poId) {
        PurchaseOrder po = getPurchaseOrderById(poId);

        if ("RECEIVED".equals(po.getStatus())) {
            throw new RuntimeException("Phiếu nhập này đã được xác nhận nhập kho rồi!");
        }

        // Lấy tất cả chi tiết của phiếu nhập này
        List<PurchaseOrderDetail> details = poDetailService.getDetailsByPoId(poId);

        // Duyệt qua từng chi tiết và cộng vào Kho
        for (PurchaseOrderDetail detail : details) {
            if (detail.getQuantityReceived() > 0) {
                // Gọi sang InventoryService để cộng số lượng thực nhận
                inventoryService.updateStock(
                        detail.getProduct().getProductId(),
                        po.getBranch().getBranchId(),
                        detail.getQuantityReceived() // Truyền số dương để cộng kho
                );
            }
        }

        // Đổi trạng thái PO thành hoàn tất
        po.setStatus("RECEIVED");
        purchaseOrderRepository.save(po);
    }
}