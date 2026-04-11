package com.forher.erp_backend.service.Interface;
import com.forher.erp_backend.entity.SalesReport;

public interface ISalesReportService {
    // Nghiệp vụ tổng hợp dữ liệu
    SalesReport generateDailyReport(String branchId, String date);
    SalesReport generateMonthlyReport(String branchId, int month, int year);

    // Xuất file Excel (Trả về đường dẫn hoặc mảng byte)
    byte[] exportReportToExcel(String reportId);
}