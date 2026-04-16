package com.forher.erp_backend.service.Interface;
import com.forher.erp_backend.entity.Orders;

import java.util.List;

public interface IOrdersService {
    List<Orders> getAllOrders();
    Orders getOrderById(String id);
    Orders updateOrder(String id, Orders orderDetails);
    void deleteOrder(String id);
    // Nghiệp vụ Bán hàng cốt lõi
    Orders createOnlineOrder(Orders order);
    Orders createOfflineOrder(Orders order);

    void applyDiscount(String orderId, double discountAmount);
    String processPayment(String orderId, String paymentMethod); // Xử lý thanh toán
    void cancelOrder(String orderId); // Hủy đơn, cộng lại kho
}