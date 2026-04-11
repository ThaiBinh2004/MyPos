package com.forher.erp_backend.service;

import com.forher.erp_backend.entity.OrderDetail;
import com.forher.erp_backend.entity.Orders;
import com.forher.erp_backend.repository.OrderDetailRepository;
import com.forher.erp_backend.service.Interface.IInventoryService;
import com.forher.erp_backend.service.Interface.IOrderDetailService;
import com.forher.erp_backend.service.Interface.IOrdersService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderDetailService implements IOrderDetailService {

    private final OrderDetailRepository orderDetailRepository;
    private final IOrdersService ordersService;
    private final IInventoryService inventoryService;

    @Override
    public List<OrderDetail> getAllOrderDetails() {
        return orderDetailRepository.findAll();
    }

    @Override
    public OrderDetail getOrderDetailById(String id) {
        return orderDetailRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy chi tiết đơn mã: " + id));
    }

    @Override
    @Transactional
    public OrderDetail createOrderDetail(OrderDetail detail) {
        // 1. Lấy thông tin đơn hàng gốc (để biết bán ở chi nhánh nào)
        Orders order = ordersService.getOrderById(detail.getOrder().getOrderId());

        // 2. Tính Subtotal = unitPrice * quantity bằng BigDecimal
        BigDecimal quantityBD = new BigDecimal(detail.getQuantity());
        BigDecimal subtotal = detail.getUnitPrice().multiply(quantityBD);
        detail.setSubtotal(subtotal);

        // 3. TỰ ĐỘNG TRỪ TỒN KHO! (Số lượng truyền vào là số âm)
        inventoryService.updateStock(
                detail.getProduct().getProductId(),
                order.getBranch().getBranchId(),
                -detail.getQuantity() // Trừ đi số lượng khách mua
        );

        return orderDetailRepository.save(detail);
    }

    @Override
    @Transactional
    public OrderDetail updateOrderDetail(String id, OrderDetail detailDetails) {
        OrderDetail existing = getOrderDetailById(id);
        // Lưu ý: Trong thực tế ERP, rất hiếm khi cho phép sửa OrderDetail sau khi đã lưu
        // Nếu muốn sửa, phải tính toán lại mức chênh lệch kho để cộng/trừ bù.
        existing.setQuantity(detailDetails.getQuantity());
        return orderDetailRepository.save(existing);
    }

    @Override
    @Transactional
    public void deleteOrderDetail(String id) {
        orderDetailRepository.deleteById(id);
    }

    @Override
    public List<OrderDetail> getDetailsByOrderId(String orderId) {
        return orderDetailRepository.findAll().stream()
                .filter(d -> d.getOrder() != null && d.getOrder().getOrderId().equals(orderId))
                .collect(Collectors.toList());
    }
}