package com.forher.erp_backend.service;

import com.forher.erp_backend.entity.Orders;
import com.forher.erp_backend.repository.OrdersRepository;
import com.forher.erp_backend.service.Interface.IOrdersService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class OrdersService implements IOrdersService {

    private final OrdersRepository ordersRepository;

    @Override
    public List<Orders> getAllOrders() {
        return ordersRepository.findAll();
    }

    @Override
    public Orders getOrderById(String id) {
        return ordersRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng mã: " + id));
    }

    @Override
    @Transactional
    public Orders updateOrder(String id, Orders orderDetails) {
        Orders existing = getOrderById(id);
        existing.setStatus(orderDetails.getStatus());
        existing.setShippingAddress(orderDetails.getShippingAddress());
        // Cập nhật thêm các trường khác nếu cần
        return ordersRepository.save(existing);
    }

    @Override
    @Transactional
    public void deleteOrder(String id) {
        ordersRepository.deleteById(id);
    }

    // NGHIỆP VỤ BÁN HÀNG
    @Override
    @Transactional
    public Orders createOnlineOrder(Orders order) {
        order.setOrderType("ONLINE");
        order.setStatus("PENDING"); // Đơn mới thì chờ xử lý
        return ordersRepository.save(order);
    }

    @Override
    @Transactional
    public Orders createOfflineOrder(Orders order) {
        order.setOrderType("OFFLINE");
        order.setStatus("COMPLETED"); // POS thu tiền ngay
        return ordersRepository.save(order);
    }

    @Override
    @Transactional
    public void applyDiscount(String orderId, double discountAmount) {
        Orders order = getOrderById(orderId);
        BigDecimal discount = BigDecimal.valueOf(discountAmount);

        // Trừ tiền: totalAmount = totalAmount - discount
        BigDecimal newTotal = order.getTotalAmount().subtract(discount);

        // Đảm bảo tổng tiền không bị âm
        if (newTotal.compareTo(BigDecimal.ZERO) < 0) {
            newTotal = BigDecimal.ZERO;
        }

        order.setTotalAmount(newTotal);
        ordersRepository.save(order);
    }

    @Override
    @Transactional
    public String processPayment(String orderId, String paymentMethod) {
        Orders order = getOrderById(orderId);
        order.setPaymentMethod(paymentMethod);
        order.setStatus("PAID");
        ordersRepository.save(order);
        return "Thanh toán " + paymentMethod + " thành công cho đơn: " + orderId;
    }

    @Override
    @Transactional
    public void cancelOrder(String orderId) {
        Orders order = getOrderById(orderId);
        if ("CANCELLED".equals(order.getStatus())) {
            throw new RuntimeException("Đơn hàng này đã bị hủy rồi!");
        }
        order.setStatus("CANCELLED");
        ordersRepository.save(order);

        // Lưu ý: Đáng lẽ chỗ này phải gọi ngược lại InventoryService để cộng lại kho,
        // nhưng sẽ xử lý ở tầng logic phía trên hoặc OrderDetail để tránh vòng lặp (Circular Dependency)
    }
}