package com.forher.erp_backend.dto;

import com.forher.erp_backend.entity.OrderDetail;
import com.forher.erp_backend.entity.Orders;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record OrderResponse(
        String orderId,
        String customerId,
        String customerName,
        String customerPhone,
        String branchId,
        String branchName,
        String employeeId,
        String employeeName,
        String orderType,
        BigDecimal totalAmount,
        BigDecimal discountAmount,
        BigDecimal shippingFee,
        Integer loyaltyPointsUsed,
        String paymentMethod,
        String shippingAddress,
        String note,
        String status,
        LocalDateTime createdAt,
        List<OrderDetailDto> details
) {
    public record OrderDetailDto(
            String detailId,
            String productId,
            String productName,
            String sku,
            Integer quantity,
            BigDecimal unitPrice,
            BigDecimal subtotal
    ) {
        public static OrderDetailDto from(OrderDetail d) {
            return new OrderDetailDto(
                    d.getDetailId(),
                    d.getProduct().getProductId(),
                    d.getProduct().getProductName(),
                    d.getProduct().getSku(),
                    d.getQuantity(),
                    d.getUnitPrice(),
                    d.getSubtotal()
            );
        }
    }

    public static OrderResponse from(Orders o, List<OrderDetail> details) {
        return new OrderResponse(
                o.getOrderId(),
                o.getCustomer() != null ? o.getCustomer().getCustomerId() : null,
                o.getCustomer() != null ? o.getCustomer().getFullName() : "Khách vãng lai",
                o.getCustomer() != null ? o.getCustomer().getPhoneNumber() : null,
                o.getBranch() != null ? o.getBranch().getBranchId() : null,
                o.getBranch() != null ? o.getBranch().getBranchName() : null,
                o.getEmployee() != null ? o.getEmployee().getEmployeeId() : null,
                o.getEmployee() != null ? o.getEmployee().getFullName() : null,
                o.getOrderType(),
                o.getTotalAmount(),
                o.getDiscountAmount() != null ? o.getDiscountAmount() : BigDecimal.ZERO,
                o.getShippingFee() != null ? o.getShippingFee() : BigDecimal.ZERO,
                o.getLoyaltyPointsUsed() != null ? o.getLoyaltyPointsUsed() : 0,
                o.getPaymentMethod(),
                o.getShippingAddress(),
                o.getNote(),
                o.getStatus(),
                o.getCreatedAt(),
                details != null ? details.stream().map(OrderDetailDto::from).toList() : List.of()
        );
    }

    public static OrderResponse from(Orders o) {
        return from(o, List.of());
    }
}
