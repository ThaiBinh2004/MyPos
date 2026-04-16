package com.forher.erp_backend.service.Interface;
import com.forher.erp_backend.entity.SalesReport;
import java.util.List;

public interface ISalesReportService {
    List<SalesReport> getAllReports();
    SalesReport generateDailyReport(String branchId, String date);
    SalesReport generateMonthlyReport(String branchId, int month, int year);
    byte[] exportReportToExcel(String reportId);
}
