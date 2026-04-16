package com.forher.erp_backend.dto;

import com.forher.erp_backend.entity.Orders;
import java.math.BigDecimal;
import java.time.LocalDateTime;

public record OrderResponse(
        String orderId,
        String customerId,
        String customerName,
        String branchId,
        String branchName,
        String employeeId,
        String employeeName,
        String orderType,
        BigDecimal totalAmount,
        String paymentMethod,
        String shippingAddress,
        String status,
        LocalDateTime createdAt
) {
    public static OrderResponse from(Orders o) {
        return new OrderResponse(
                o.getOrderId(),
                o.getCustomer() != null ? o.getCustomer().getCustomerId() : null,
                o.getCustomer() != null ? o.getCustomer().getFullName() : null,
                o.getBranch() != null ? o.getBranch().getBranchId() : null,
                o.getBranch() != null ? o.getBranch().getBranchName() : null,
                o.getEmployee() != null ? o.getEmployee().getEmployeeId() : null,
                o.getEmployee() != null ? o.getEmployee().getFullName() : null,
                o.getOrderType(),
                o.getTotalAmount(),
                o.getPaymentMethod(),
                o.getShippingAddress(),
                o.getStatus(),
                o.getCreatedAt()
        );
    }
}
