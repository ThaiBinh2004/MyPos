package com.forher.erp_backend.service.Interface;

import com.forher.erp_backend.entity.OrderDetail;
import java.util.List;

public interface IOrderDetailService {
    List<OrderDetail> getAllOrderDetails();
    OrderDetail getOrderDetailById(String id);
    OrderDetail createOrderDetail(OrderDetail orderDetail);
    OrderDetail updateOrderDetail(String id, OrderDetail orderDetailDetails);
    void deleteOrderDetail(String id);

    // Nghiệp vụ: Lấy chi tiết hóa đơn của một mã đơn hàng cụ thể
    List<OrderDetail> getDetailsByOrderId(String orderId);
}