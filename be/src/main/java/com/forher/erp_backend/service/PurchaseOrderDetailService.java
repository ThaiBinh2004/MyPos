package com.forher.erp_backend.service;

import com.forher.erp_backend.entity.PurchaseOrderDetail;
import com.forher.erp_backend.repository.PurchaseOrderDetailRepository;
import com.forher.erp_backend.service.Interface.IPurchaseOrderDetailService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PurchaseOrderDetailService implements IPurchaseOrderDetailService {

    private final PurchaseOrderDetailRepository poDetailRepository;

    @Override
    public List<PurchaseOrderDetail> getAllPurchaseOrderDetails() {
        return poDetailRepository.findAll();
    }

    @Override
    public PurchaseOrderDetail getPurchaseOrderDetailById(String id) {
        return poDetailRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy Chi tiết phiếu nhập mã: " + id));
    }

    @Override
    @Transactional
    public PurchaseOrderDetail createPurchaseOrderDetail(PurchaseOrderDetail detail) {
        // Mặc định khi mới tạo, số lượng thực nhận chưa có
        if (detail.getQuantityReceived() == null) {
            detail.setQuantityReceived(0);
        }
        return poDetailRepository.save(detail);
    }

    @Override
    @Transactional
    public PurchaseOrderDetail updatePurchaseOrderDetail(String id, PurchaseOrderDetail detailDetails) {
        PurchaseOrderDetail existing = getPurchaseOrderDetailById(id);
        existing.setQuantityReceived(detailDetails.getQuantityReceived());
        existing.setNote(detailDetails.getNote());
        return poDetailRepository.save(existing);
    }

    @Override
    @Transactional
    public void deletePurchaseOrderDetail(String id) {
        poDetailRepository.deleteById(id);
    }

    @Override
    public List<PurchaseOrderDetail> getDetailsByPoId(String poId) {
        return poDetailRepository.findAll().stream()
                .filter(d -> d.getPurchaseOrder() != null && d.getPurchaseOrder().getPoId().equals(poId))
                .collect(Collectors.toList());
    }
}