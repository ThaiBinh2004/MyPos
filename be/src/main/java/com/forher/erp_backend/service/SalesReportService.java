package com.forher.erp_backend.service;

import com.forher.erp_backend.entity.Branch;
import com.forher.erp_backend.entity.Orders;
import com.forher.erp_backend.entity.SalesReport;
import com.forher.erp_backend.repository.BranchRepository;
import com.forher.erp_backend.repository.OrdersRepository;
import com.forher.erp_backend.repository.SalesReportRepository;
import com.forher.erp_backend.service.Interface.ISalesReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SalesReportService implements ISalesReportService {

    private final SalesReportRepository salesReportRepository;
    private final OrdersRepository ordersRepository;
    private final BranchRepository branchRepository;

    @Override
    public List<SalesReport> getAllReports() {
        return salesReportRepository.findAll();
    }

    // Hàm phụ trợ tính tổng doanh thu từ danh sách đơn hàng
    private BigDecimal calculateTotalRevenue(List<Orders> orders) {
        return orders.stream()
                .map(Orders::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    @Override
    @Transactional
    public SalesReport generateDailyReport(String branchId, String dateString) {
        LocalDate date = LocalDate.parse(dateString); // Format: yyyy-MM-dd
        Branch branch = branchRepository.findById(branchId)
                .orElseThrow(() -> new RuntimeException("Chi nhánh không tồn tại"));

        // Lấy tất cả đơn hàng ĐÃ THANH TOÁN của chi nhánh này trong ngày
        List<Orders> dailyOrders = ordersRepository.findAll().stream()
                .filter(o -> o.getBranch().getBranchId().equals(branchId)
                        && o.getCreatedAt().toLocalDate().equals(date)
                        && ("PAID".equals(o.getStatus()) || "COMPLETED".equals(o.getStatus())))
                .collect(Collectors.toList());

        SalesReport report = SalesReport.builder()
                .reportId("REP-D-" + System.currentTimeMillis())
                .branch(branch)
                .periodType("DAILY")
                .fromDate(date)
                .toDate(date)
                .totalOrders(dailyOrders.size())
                .totalRevenue(calculateTotalRevenue(dailyOrders))
                .build();

        return salesReportRepository.save(report);
    }

    @Override
    @Transactional
    public SalesReport generateMonthlyReport(String branchId, int month, int year) {
        Branch branch = branchRepository.findById(branchId)
                .orElseThrow(() -> new RuntimeException("Chi nhánh không tồn tại"));

        // Lấy tất cả đơn hàng ĐÃ THANH TOÁN của chi nhánh này trong tháng
        List<Orders> monthlyOrders = ordersRepository.findAll().stream()
                .filter(o -> o.getBranch().getBranchId().equals(branchId)
                        && o.getCreatedAt().getMonthValue() == month
                        && o.getCreatedAt().getYear() == year
                        && ("PAID".equals(o.getStatus()) || "COMPLETED".equals(o.getStatus())))
                .collect(Collectors.toList());

        LocalDate fromDate = LocalDate.of(year, month, 1);
        LocalDate toDate = fromDate.withDayOfMonth(fromDate.lengthOfMonth());

        SalesReport report = SalesReport.builder()
                .reportId("REP-M-" + System.currentTimeMillis())
                .branch(branch)
                .periodType("MONTHLY")
                .fromDate(fromDate)
                .toDate(toDate)
                .totalOrders(monthlyOrders.size())
                .totalRevenue(calculateTotalRevenue(monthlyOrders))
                .build();

        return salesReportRepository.save(report);
    }

    @Override
    public byte[] exportReportToExcel(String reportId) {
        SalesReport report = salesReportRepository.findById(reportId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy báo cáo"));
        // TODO: dùng Apache POI để xuất Excel thực tế
        return ("Data for report " + report.getReportId()).getBytes();
    }
}