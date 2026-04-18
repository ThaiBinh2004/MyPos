package com.forher.erp_backend.controller;

import com.forher.erp_backend.entity.Orders;
import com.forher.erp_backend.repository.OrdersRepository;
import com.forher.erp_backend.service.Interface.ISalesReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/sales/reports")
@RequiredArgsConstructor
public class SalesReportController {

    private final ISalesReportService reportService;
    private final OrdersRepository ordersRepo;

    @GetMapping
    public ResponseEntity<?> getAll() {
        return ResponseEntity.ok(reportService.getAllReports());
    }

    @GetMapping("/dashboard")
    public ResponseEntity<?> dashboard(
            @RequestParam(required = false) String branchId,
            @RequestParam(required = false) String dateFrom,
            @RequestParam(required = false) String dateTo) {

        LocalDate from = dateFrom != null ? LocalDate.parse(dateFrom) : LocalDate.now().minusMonths(1);
        LocalDate to = dateTo != null ? LocalDate.parse(dateTo) : LocalDate.now();

        List<Orders> orders = ordersRepo.findAll().stream()
                .filter(o -> !("CANCELLED".equalsIgnoreCase(o.getStatus())))
                .filter(o -> o.getCreatedAt() != null)
                .filter(o -> {
                    LocalDate d = o.getCreatedAt().toLocalDate();
                    return !d.isBefore(from) && !d.isAfter(to);
                })
                .filter(o -> branchId == null || branchId.isBlank()
                        || (o.getBranch() != null && branchId.equals(o.getBranch().getBranchId())))
                .collect(Collectors.toList());

        BigDecimal totalRevenue = orders.stream().map(Orders::getTotalAmount).reduce(BigDecimal.ZERO, BigDecimal::add);
        int totalOrders = orders.size();
        BigDecimal avgOrderValue = totalOrders > 0 ? totalRevenue.divide(BigDecimal.valueOf(totalOrders), 0, java.math.RoundingMode.HALF_UP) : BigDecimal.ZERO;

        // Revenue by branch
        Map<String, BigDecimal> byBranch = orders.stream()
                .filter(o -> o.getBranch() != null)
                .collect(Collectors.groupingBy(
                        o -> o.getBranch().getBranchName(),
                        Collectors.reducing(BigDecimal.ZERO, Orders::getTotalAmount, BigDecimal::add)
                ));

        // Revenue by date (daily trend)
        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("dd/MM");
        Map<String, BigDecimal> byDate = orders.stream()
                .collect(Collectors.groupingBy(
                        o -> o.getCreatedAt().toLocalDate().format(fmt),
                        TreeMap::new,
                        Collectors.reducing(BigDecimal.ZERO, Orders::getTotalAmount, BigDecimal::add)
                ));

        // Revenue by order type
        long onlineCount = orders.stream().filter(o -> "ONLINE".equalsIgnoreCase(o.getOrderType())).count();
        long offlineCount = orders.size() - onlineCount;
        BigDecimal onlineRevenue = orders.stream().filter(o -> "ONLINE".equalsIgnoreCase(o.getOrderType())).map(Orders::getTotalAmount).reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal offlineRevenue = totalRevenue.subtract(onlineRevenue);

        var byBranchList = byBranch.entrySet().stream()
                .map(e -> Map.of("name", e.getKey(), "revenue", e.getValue()))
                .collect(Collectors.toList());

        var byDateList = byDate.entrySet().stream()
                .map(e -> Map.of("date", e.getKey(), "revenue", e.getValue()))
                .collect(Collectors.toList());

        Map<String, Object> result = new HashMap<>();
        result.put("totalRevenue", totalRevenue);
        result.put("totalOrders", totalOrders);
        result.put("avgOrderValue", avgOrderValue);
        result.put("onlineOrders", onlineCount);
        result.put("offlineOrders", offlineCount);
        result.put("onlineRevenue", onlineRevenue);
        result.put("offlineRevenue", offlineRevenue);
        result.put("revenueByBranch", byBranchList);
        result.put("revenueByDate", byDateList);
        result.put("dateFrom", from.toString());
        result.put("dateTo", to.toString());
        return ResponseEntity.ok(result);
    }
}
