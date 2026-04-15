package com.forher.erp_backend.controller;

import com.forher.erp_backend.service.MomoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/payment")
@RequiredArgsConstructor
public class PaymentController {

    private final MomoService momoService;

    // 1. API Tạo Link Thanh Toán (Frontend công ty gọi vào đây)
    // Nhân viên bán hàng, Quản lý, Giám đốc đều được quyền gọi API này để lấy mã QR
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'EMPLOYEE')")
    @PostMapping("/create-momo")
    public ResponseEntity<?> createMomoPayment(@RequestParam String orderId, @RequestParam String amount) {
        try {
            String payUrl = momoService.createPaymentUrl(orderId, amount);
            return ResponseEntity.ok(Map.of("payUrl", payUrl));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // 2. API Hứng kết quả MoMo trả về (Do Server MoMo gọi)
    @GetMapping("/momo-return")
    public ResponseEntity<?> momoReturn(@RequestParam Map<String, String> params) {
        // MoMo sẽ truyền một đống biến vào URL, ta lấy mã kết quả ra xem
        String resultCode = params.get("resultCode");
        String orderId = params.get("orderId");

        if ("0".equals(resultCode)) {
            // TODO: Thanh toán thành công! Sếp gọi hàm update lại trạng thái đơn hàng (orderId) trong DB thành PAID ở đây!
            return ResponseEntity.ok("THANH TOÁN THÀNH CÔNG ĐƠN HÀNG: " + orderId);
        } else {
            return ResponseEntity.badRequest().body("THANH TOÁN THẤT BẠI - GIAO DỊCH BỊ HỦY");
        }
    }
}