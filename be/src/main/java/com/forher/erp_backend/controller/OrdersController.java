package com.forher.erp_backend.controller;

import com.forher.erp_backend.dto.OrderResponse;
import com.forher.erp_backend.dto.PaginatedResponse;
import com.forher.erp_backend.entity.*;
import com.forher.erp_backend.repository.*;
import com.forher.erp_backend.service.Interface.IInventoryService;
import com.forher.erp_backend.service.Interface.IOrdersService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.*;

@RestController
@RequestMapping("/api/v1/sales/orders")
@RequiredArgsConstructor
public class OrdersController {

    private final IOrdersService ordersService;
    private final OrderDetailRepository detailRepo;
    private final OrdersRepository ordersRepo;
    private final EmployeeRepository employeeRepo;
    private final BranchRepository branchRepo;
    private final CustomerRepository customerRepo;
    private final ProductRepository productRepo;
    private final IInventoryService inventoryService;

    @GetMapping
    public ResponseEntity<?> getAll(@RequestParam(required = false) String type,
                                     @RequestParam(required = false) String status,
                                     @RequestParam(required = false) String branchId) {
        var list = ordersService.getAllOrders().stream()
                .filter(o -> type == null || type.isBlank() || type.equalsIgnoreCase(o.getOrderType()))
                .filter(o -> status == null || status.isBlank() || status.equalsIgnoreCase(o.getStatus()))
                .filter(o -> branchId == null || branchId.isBlank()
                        || (o.getBranch() != null && branchId.equals(o.getBranch().getBranchId())))
                .sorted(Comparator.comparing(Orders::getCreatedAt, Comparator.nullsLast(Comparator.reverseOrder())))
                .map(o -> OrderResponse.from(o, detailRepo.findByOrderOrderId(o.getOrderId())))
                .toList();
        return ResponseEntity.ok(PaginatedResponse.of(list));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getById(@PathVariable String id) {
        try {
            Orders o = ordersService.getOrderById(id);
            return ResponseEntity.ok(OrderResponse.from(o, detailRepo.findByOrderOrderId(id)));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody Map<String, Object> payload) {
        try {
            String orderType = (String) payload.get("orderType");
            String employeeId = (String) payload.get("employeeId");
            String branchId = (String) payload.get("branchId");
            String customerId = (String) payload.get("customerId");
            String paymentMethod = (String) payload.getOrDefault("paymentMethod", "CASH");
            String shippingAddress = (String) payload.get("shippingAddress");
            String note = (String) payload.get("note");
            BigDecimal shippingFee = payload.get("shippingFee") != null
                    ? new BigDecimal(payload.get("shippingFee").toString()) : BigDecimal.ZERO;
            int loyaltyPointsUsed = payload.get("loyaltyPointsUsed") != null
                    ? Integer.parseInt(payload.get("loyaltyPointsUsed").toString()) : 0;

            Branch branch = branchRepo.findById(branchId)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy chi nhánh: " + branchId));
            Employee employee = employeeRepo.findById(employeeId)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy nhân viên: " + employeeId));
            Customer customer = null;
            if (customerId != null && !customerId.isBlank()) {
                customer = customerRepo.findById(customerId).orElse(null);
            }

            @SuppressWarnings("unchecked")
            List<Map<String, Object>> detailsRaw = (List<Map<String, Object>>) payload.get("details");
            if (detailsRaw == null || detailsRaw.isEmpty()) {
                return ResponseEntity.badRequest().body("Đơn hàng phải có ít nhất 1 sản phẩm.");
            }

            // Calculate subtotal from details
            BigDecimal subtotalSum = BigDecimal.ZERO;
            List<Object[]> detailData = new ArrayList<>();
            for (Map<String, Object> d : detailsRaw) {
                String productId = (String) d.get("productId");
                int qty = Integer.parseInt(d.get("quantity").toString());
                BigDecimal unitPrice = new BigDecimal(d.get("unitPrice").toString());
                BigDecimal sub = unitPrice.multiply(BigDecimal.valueOf(qty));
                subtotalSum = subtotalSum.add(sub);
                detailData.add(new Object[]{productId, qty, unitPrice, sub});
            }

            // Discount from loyalty points (1 point = 1000 VND)
            BigDecimal discountAmount = BigDecimal.valueOf(loyaltyPointsUsed).multiply(BigDecimal.valueOf(1000));
            BigDecimal totalAmount = subtotalSum.add(shippingFee).subtract(discountAmount);
            if (totalAmount.compareTo(BigDecimal.ZERO) < 0) totalAmount = BigDecimal.ZERO;

            String orderId = "ORD" + String.format("%06d", ordersRepo.count() + 1);
            boolean isOnline = "ONLINE".equalsIgnoreCase(orderType);

            Orders order = Orders.builder()
                    .orderId(orderId)
                    .customer(customer)
                    .branch(branch)
                    .employee(employee)
                    .orderType(isOnline ? "ONLINE" : "OFFLINE")
                    .totalAmount(totalAmount)
                    .discountAmount(discountAmount)
                    .shippingFee(shippingFee)
                    .loyaltyPointsUsed(loyaltyPointsUsed)
                    .paymentMethod(paymentMethod)
                    .shippingAddress(shippingAddress)
                    .note(note)
                    .status(isOnline ? "PENDING" : "COMPLETED")
                    .build();
            ordersRepo.save(order);

            // Create details + deduct inventory
            List<OrderDetail> savedDetails = new ArrayList<>();
            for (Object[] d : detailData) {
                String productId = (String) d[0];
                int qty = (int) d[1];
                BigDecimal unitPrice = (BigDecimal) d[2];
                BigDecimal sub = (BigDecimal) d[3];

                Product product = productRepo.findById(productId)
                        .orElseThrow(() -> new RuntimeException("Không tìm thấy sản phẩm: " + productId));

                String detailId = "DT" + UUID.randomUUID().toString().replace("-", "").substring(0, 10).toUpperCase();
                OrderDetail detail = OrderDetail.builder()
                        .detailId(detailId)
                        .order(order)
                        .product(product)
                        .quantity(qty)
                        .unitPrice(unitPrice)
                        .subtotal(sub)
                        .build();
                detailRepo.save(detail);
                savedDetails.add(detail);

                // Deduct inventory
                try {
                    inventoryService.updateStock(productId, branchId, -qty);
                } catch (Exception ignored) {}
            }

            // Apply loyalty points to customer
            if (customer != null) {
                int earnedPoints = totalAmount.divide(BigDecimal.valueOf(100000), 0, java.math.RoundingMode.DOWN).intValue();
                customer.setLoyaltyPoints(customer.getLoyaltyPoints() - loyaltyPointsUsed + earnedPoints);
                customerRepo.save(customer);
            }

            return ResponseEntity.status(HttpStatus.CREATED).body(OrderResponse.from(order, savedDetails));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(@PathVariable String id, @RequestBody Map<String, String> payload) {
        try {
            String status = payload.get("status");
            Orders o = ordersService.getOrderById(id);
            o.setStatus(status);
            if (payload.containsKey("note")) o.setNote(payload.get("note"));
            ordersRepo.save(o);
            return ResponseEntity.ok(OrderResponse.from(o, detailRepo.findByOrderOrderId(id)));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
