package com.forher.erp_backend.controller;

import com.forher.erp_backend.entity.Promotion;
import com.forher.erp_backend.repository.PromotionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/sales/promotions")
@RequiredArgsConstructor
public class PromotionController {

    private final PromotionRepository promotionRepo;

    @GetMapping
    public ResponseEntity<?> getAll() {
        return ResponseEntity.ok(promotionRepo.findAll().stream()
                .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                .toList());
    }

    @GetMapping("/active")
    public ResponseEntity<?> getActive() {
        LocalDate today = LocalDate.now();
        return ResponseEntity.ok(promotionRepo
                .findByActiveTrueAndStartDateLessThanEqualAndEndDateGreaterThanEqual(today, today));
    }

    @GetMapping("/check")
    public ResponseEntity<?> checkCode(@RequestParam String code, @RequestParam(required = false) String orderAmount) {
        return promotionRepo.findByCode(code).map(p -> {
            LocalDate today = LocalDate.now();
            if (!Boolean.TRUE.equals(p.getActive())) return ResponseEntity.badRequest().body("Mã khuyến mãi không còn hiệu lực.");
            if (p.getStartDate() != null && today.isBefore(p.getStartDate())) return ResponseEntity.badRequest().body("Chương trình chưa bắt đầu.");
            if (p.getEndDate() != null && today.isAfter(p.getEndDate())) return ResponseEntity.badRequest().body("Chương trình đã kết thúc.");
            if (orderAmount != null && p.getMinOrderAmount() != null) {
                BigDecimal amount = new BigDecimal(orderAmount);
                if (amount.compareTo(p.getMinOrderAmount()) < 0)
                    return ResponseEntity.badRequest().body("Đơn hàng chưa đạt giá trị tối thiểu " + p.getMinOrderAmount() + " ₫");
            }
            return ResponseEntity.ok(p);
        }).orElse(ResponseEntity.status(HttpStatus.NOT_FOUND).body("Không tìm thấy mã khuyến mãi."));
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody Map<String, Object> payload) {
        try {
            String id = "PROMO" + UUID.randomUUID().toString().replace("-", "").substring(0, 6).toUpperCase();
            Promotion p = Promotion.builder()
                    .promotionId(id)
                    .name((String) payload.get("name"))
                    .code((String) payload.get("code"))
                    .discountType((String) payload.get("discountType"))
                    .discountValue(new BigDecimal(payload.get("discountValue").toString()))
                    .minOrderAmount(payload.get("minOrderAmount") != null ? new BigDecimal(payload.get("minOrderAmount").toString()) : BigDecimal.ZERO)
                    .maxDiscountAmount(payload.get("maxDiscountAmount") != null ? new BigDecimal(payload.get("maxDiscountAmount").toString()) : null)
                    .startDate(payload.get("startDate") != null ? LocalDate.parse((String) payload.get("startDate")) : null)
                    .endDate(payload.get("endDate") != null ? LocalDate.parse((String) payload.get("endDate")) : null)
                    .description((String) payload.get("description"))
                    .active(true)
                    .build();
            return ResponseEntity.status(HttpStatus.CREATED).body(promotionRepo.save(p));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PatchMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable String id, @RequestBody Map<String, Object> payload) {
        return promotionRepo.findById(id).map(p -> {
            if (payload.containsKey("name")) p.setName((String) payload.get("name"));
            if (payload.containsKey("discountType")) p.setDiscountType((String) payload.get("discountType"));
            if (payload.containsKey("discountValue")) p.setDiscountValue(new BigDecimal(payload.get("discountValue").toString()));
            if (payload.containsKey("minOrderAmount")) p.setMinOrderAmount(new BigDecimal(payload.get("minOrderAmount").toString()));
            if (payload.containsKey("maxDiscountAmount")) p.setMaxDiscountAmount(payload.get("maxDiscountAmount") != null ? new BigDecimal(payload.get("maxDiscountAmount").toString()) : null);
            if (payload.containsKey("startDate")) p.setStartDate(payload.get("startDate") != null ? LocalDate.parse((String) payload.get("startDate")) : null);
            if (payload.containsKey("endDate")) p.setEndDate(payload.get("endDate") != null ? LocalDate.parse((String) payload.get("endDate")) : null);
            if (payload.containsKey("description")) p.setDescription((String) payload.get("description"));
            if (payload.containsKey("active")) p.setActive((Boolean) payload.get("active"));
            return ResponseEntity.ok(promotionRepo.save(p));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable String id) {
        if (!promotionRepo.existsById(id)) return ResponseEntity.notFound().build();
        promotionRepo.deleteById(id);
        return ResponseEntity.ok("Đã xóa.");
    }
}
