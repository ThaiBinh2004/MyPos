package com.forher.erp_backend.service;

import com.forher.erp_backend.entity.*;
import com.forher.erp_backend.repository.*;
import com.forher.erp_backend.service.Interface.IPayrollService;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.*;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PayrollService implements IPayrollService {

    private final PayrollRepository          payrollRepository;
    private final SalesRecordRepository      salesRecordRepository;
    private final PayrollDeductionRepository deductionRepository;
    private final EmployeeRepository         employeeRepository;
    private final ContractRepository         contractRepository;
    private final AttendanceRepository       attendanceRepository;

    private static final long   OT_RATE          = 27_000L;
    private static final long   OT_HOLIDAY_RATE  = 81_000L;   // 27.000 × 3
    private static final int    STD_WORK_DAYS    = 26;
    private static final int    MAX_LEAVE_DAYS   = 4;
    private static final double BHXH_RATE        = 0.105;     // NV đóng 10.5%
    private static final long   PERSONAL_DEDUCT  = 11_000_000L;
    private static final long   DEPENDENT_DEDUCT = 4_400_000L;

    // ══════════════════════════════════════════════════════════════════
    // GENERATE / RECALCULATE
    // ══════════════════════════════════════════════════════════════════

    @Override
    @Transactional
    public Payroll generatePayroll(String employeeId, String month, String createdById) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy nhân viên!"));

        Payroll existing = payrollRepository
                .findByEmployeeEmployeeIdAndMonth(employeeId, month).orElse(null);

        if (existing != null && "FINALIZED".equals(existing.getStatus()))
            throw new RuntimeException("Bảng lương tháng " + month + " đã được chốt!");

        // Hợp đồng: ưu tiên ACTIVE, nếu không có thì lấy hợp đồng mới nhất bất kỳ
        Contract contract = contractRepository
                .findByEmployeeEmployeeIdOrderByStartDateDesc(employeeId)
                .stream()
                .filter(c -> "ACTIVE".equals(c.getStatus()))
                .findFirst()
                .or(() -> contractRepository
                        .findByEmployeeEmployeeIdOrderByStartDateDesc(employeeId)
                        .stream().findFirst())
                .orElseThrow(() -> new RuntimeException("Nhân viên " + employeeId + " chưa có hợp đồng nào!"));

        // Giữ lại các trường nhập tay nếu đã có bản ghi
        int        leaveDays       = existing != null ? existing.getLeaveDays()       : 0;
        BigDecimal otHours         = existing != null ? existing.getOtHours()         : BigDecimal.ZERO;
        BigDecimal otHolidayHours  = existing != null ? existing.getOtHolidayHours()  : BigDecimal.ZERO;
        BigDecimal allowanceRate   = existing != null ? existing.getAllowanceRate()    : BigDecimal.ONE;
        String     abcRating       = existing != null ? existing.getAbcRating()        : null;
        String     note            = existing != null ? existing.getNote()             : null;

        // ── 1. Ngày công từ Attendance ────────────────────────────────
        YearMonth ym   = YearMonth.parse(month);
        LocalDate from = ym.atDay(1);
        LocalDate to   = ym.atEndOfMonth();
        List<Attendance> attendances = attendanceRepository.findByEmployeeAndDateRange(employeeId, from, to);
        int workDays = (int) attendances.stream()
                .filter(a -> List.of("ON_TIME","LATE","EARLY_LEAVE","CORRECTED","PRESENT","MISSING_CHECKOUT")
                        .contains(a.getStatus()))
                .count();

        // ── 2. Lương cơ bản ───────────────────────────────────────────
        BigDecimal contractSalary = contract.getBaseSalary();
        BigDecimal dailyRate = contractSalary.divide(BigDecimal.valueOf(STD_WORK_DAYS), 0, RoundingMode.HALF_UP);
        int validWork  = Math.min(workDays,  STD_WORK_DAYS);
        int validLeave = Math.min(leaveDays, MAX_LEAVE_DAYS);
        BigDecimal basePay = dailyRate.multiply(BigDecimal.valueOf(validWork + validLeave));

        // ── 3. Phụ cấp ────────────────────────────────────────────────
        BigDecimal contractAllowance = contract.getAllowance() != null ? contract.getAllowance() : BigDecimal.ZERO;
        BigDecimal allowancePay = contractAllowance.multiply(allowanceRate).setScale(0, RoundingMode.HALF_UP);

        // ── 4. OT ─────────────────────────────────────────────────────
        BigDecimal otPay = otHours.multiply(BigDecimal.valueOf(OT_RATE))
                .add(otHolidayHours.multiply(BigDecimal.valueOf(OT_HOLIDAY_RATE)))
                .setScale(0, RoundingMode.HALF_UP);

        // ── 5. Thưởng doanh số ────────────────────────────────────────
        List<SalesRecord> salesRecords = salesRecordRepository
                .findByEmployeeEmployeeIdAndMonth(employeeId, month);
        BigDecimal hotBonus        = BigDecimal.ZERO;
        BigDecimal livestreamBonus = BigDecimal.ZERO;
        for (SalesRecord sr : salesRecords) {
            if (sr.getSalesAmount() != null) {
                if (sr.getSalesAmount().compareTo(BigDecimal.valueOf(10_000_000)) > 0)
                    hotBonus = hotBonus.add(BigDecimal.valueOf(200_000));
                else if (sr.getSalesAmount().compareTo(BigDecimal.valueOf(7_500_000)) > 0)
                    hotBonus = hotBonus.add(BigDecimal.valueOf(150_000));
            }
            if (sr.getProductCount() != null && sr.getProductCount() > 50)
                livestreamBonus = livestreamBonus.add(BigDecimal.valueOf(200_000));
        }
        BigDecimal salesBonus = hotBonus.add(livestreamBonus);

        // ── 6. Thưởng ABC ─────────────────────────────────────────────
        BigDecimal abcBonus = calcAbcBonus(abcRating);

        // ── 7. Tổng gross ─────────────────────────────────────────────
        BigDecimal totalGross = basePay.add(allowancePay).add(otPay)
                .add(salesBonus).add(abcBonus);

        // ── 8. BHXH (10.5% lương HĐ) ─────────────────────────────────
        BigDecimal bhxhEmployee = contractSalary
                .multiply(BigDecimal.valueOf(BHXH_RATE)).setScale(0, RoundingMode.HALF_UP);

        // ── 9. Thuế TNCN ──────────────────────────────────────────────
        int dependents = employee.getDependents() != null ? employee.getDependents() : 0;
        BigDecimal taxable = totalGross
                .subtract(bhxhEmployee)
                .subtract(BigDecimal.valueOf(PERSONAL_DEDUCT))
                .subtract(BigDecimal.valueOf((long) dependents * DEPENDENT_DEDUCT));
        BigDecimal tncn = taxable.compareTo(BigDecimal.ZERO) <= 0
                ? BigDecimal.ZERO : calcTncn(taxable);

        // ── 10. Khấu trừ tạm ứng / phạt ─────────────────────────────
        List<PayrollDeduction> deductions = deductionRepository
                .findByEmployeeEmployeeIdAndMonth(employeeId, month);
        BigDecimal advance = deductions.stream()
                .filter(d -> "ADVANCE".equals(d.getType()))
                .map(PayrollDeduction::getAmount).reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal penalty = deductions.stream()
                .filter(d -> "PENALTY".equals(d.getType()))
                .map(PayrollDeduction::getAmount).reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal totalDeduction = bhxhEmployee.add(tncn).add(advance).add(penalty);

        // ── 11. Lương thực nhận ───────────────────────────────────────
        BigDecimal netSalary = totalGross.subtract(totalDeduction).max(BigDecimal.ZERO);

        // ── Lưu ───────────────────────────────────────────────────────
        String     payrollId = "PAY-" + employeeId + "-" + month;
        Employee   creator   = createdById != null
                ? employeeRepository.findById(createdById).orElse(null) : null;

        Payroll p = existing != null ? existing : Payroll.builder()
                .payrollId(payrollId).employee(employee).month(month)
                .createdAt(LocalDateTime.now()).build();

        p.setWorkDays(workDays);     p.setLeaveDays(leaveDays);
        p.setOtHours(otHours);       p.setOtHolidayHours(otHolidayHours);
        p.setBaseSalary(contractSalary); p.setBasePay(basePay);
        p.setAllowance(contractAllowance); p.setAllowanceRate(allowanceRate);
        p.setAllowancePay(allowancePay);
        p.setOvertimePay(otPay);
        p.setHotBonus(hotBonus);     p.setLivestreamBonus(livestreamBonus);
        p.setSalesBonus(salesBonus);
        p.setAbcRating(abcRating);   p.setAbcBonus(abcBonus);
        p.setTotalGross(totalGross);
        p.setBhxhEmployee(bhxhEmployee); p.setTncn(tncn);
        p.setAdvance(advance);       p.setPenalty(penalty);
        p.setDeduction(totalDeduction);  p.setNetSalary(netSalary);
        p.setNote(note);
        if (creator != null) p.setApprovedBy(creator);

        return payrollRepository.save(p);
    }

    @Override
    public List<Payroll> generateBulk(String month, String branchId, String createdById) {
        List<Employee> employees = branchId != null
                ? employeeRepository.findByBranchBranchIdAndStatus(branchId, "ACTIVE")
                : employeeRepository.findAll().stream()
                    .filter(e -> "ACTIVE".equals(e.getStatus())).toList();

        System.out.println(">>> generateBulk: " + employees.size() + " nhân viên cho tháng " + month);
        return employees.stream().map(e -> {
            try {
                Payroll p = generatePayroll(e.getEmployeeId(), month, createdById);
                System.out.println(">>> OK: " + e.getEmployeeId() + " netSalary=" + p.getNetSalary());
                return p;
            } catch (Exception ex) {
                System.err.println(">>> SKIP " + e.getEmployeeId() + ": " + ex.getMessage());
                return null;
            }
        }).filter(p -> p != null).toList();
    }

    // ══════════════════════════════════════════════════════════════════
    // CẬP NHẬT THỦ CÔNG
    // ══════════════════════════════════════════════════════════════════

    @Override
    @Transactional
    public Payroll updateManual(String payrollId, Integer leaveDays, BigDecimal otHours,
                                BigDecimal otHolidayHours, BigDecimal allowanceRate,
                                String abcRating, String note) {
        Payroll p = payrollRepository.findById(payrollId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy bảng lương!"));
        if ("FINALIZED".equals(p.getStatus()))
            throw new RuntimeException("Bảng lương đã chốt, không thể chỉnh sửa!");

        if (leaveDays      != null) p.setLeaveDays(leaveDays);
        if (otHours        != null) p.setOtHours(otHours);
        if (otHolidayHours != null) p.setOtHolidayHours(otHolidayHours);
        if (allowanceRate  != null) p.setAllowanceRate(allowanceRate);
        if (abcRating      != null) p.setAbcRating(abcRating);
        if (note           != null) p.setNote(note);
        payrollRepository.save(p); // lưu giá trị nhập tay trước

        String creatorId = p.getApprovedBy() != null ? p.getApprovedBy().getEmployeeId() : null;
        return generatePayroll(p.getEmployee().getEmployeeId(), p.getMonth(), creatorId);
    }

    @Override
    @Transactional
    public Payroll finalizePayroll(String payrollId) {
        Payroll p = payrollRepository.findById(payrollId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy bảng lương!"));
        p.setStatus("FINALIZED");
        p.setFinalizedAt(LocalDateTime.now());
        return payrollRepository.save(p);
    }

    // ══════════════════════════════════════════════════════════════════
    // IMPORT EXCEL DOANH SỐ
    // ══════════════════════════════════════════════════════════════════

    @Override
    @Transactional
    public int importSales(MultipartFile file, String month, String importedBy) {
        int count = 0;
        try (Workbook wb = new XSSFWorkbook(file.getInputStream())) {
            Sheet sheet = wb.getSheetAt(0);
            for (int i = 1; i <= sheet.getLastRowNum(); i++) {
                Row row = sheet.getRow(i);
                if (row == null) continue;
                String employeeId = getCellString(row, 0);
                if (employeeId == null || employeeId.isBlank()) continue;
                Employee emp = employeeRepository.findById(employeeId).orElse(null);
                if (emp == null) continue;

                salesRecordRepository.save(SalesRecord.builder()
                        .employee(emp)
                        .shiftDate(getCellDate(row, 3) != null ? getCellDate(row, 3) : LocalDate.now())
                        .shift(getCellString(row, 4))
                        .salesAmount(getCellDecimal(row, 2))
                        .productCount(getCellInt(row, 5) != null ? getCellInt(row, 5) : 0)
                        .month(month)
                        .importedBy(importedBy)
                        .importedAt(LocalDateTime.now())
                        .build());
                count++;
            }
        } catch (Exception e) {
            throw new RuntimeException("Lỗi đọc file Excel: " + e.getMessage());
        }
        return count;
    }

    // ══════════════════════════════════════════════════════════════════
    // KHẤU TRỪ
    // ══════════════════════════════════════════════════════════════════

    @Override
    @Transactional
    public PayrollDeduction addDeduction(String employeeId, String type, BigDecimal amount,
                                         String reason, String month, String approvedById) {
        Employee emp = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy nhân viên!"));
        Employee approver = approvedById != null
                ? employeeRepository.findById(approvedById).orElse(null) : null;
        return deductionRepository.save(PayrollDeduction.builder()
                .employee(emp).type(type.toUpperCase()).amount(amount)
                .reason(reason).deductionDate(LocalDate.now())
                .month(month).approvedBy(approver).status("APPROVED").build());
    }

    // ══════════════════════════════════════════════════════════════════
    // QUERIES
    // ══════════════════════════════════════════════════════════════════

    @Override
    public List<Payroll> getPayrolls(String month, String branchId) {
        return payrollRepository.findByMonthAndBranch(month, branchId);
    }

    @Override
    public List<Payroll> getPayrollsByEmployee(String employeeId) {
        return payrollRepository.findByEmployeeEmployeeIdOrderByMonthDesc(employeeId);
    }

    @Override
    public Payroll getPayrollById(String id) {
        return payrollRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy bảng lương!"));
    }

    @Override
    public List<SalesRecord> getSalesRecords(String month, String branchId) {
        return salesRecordRepository.findByMonthAndBranch(month, branchId);
    }

    @Override
    public List<PayrollDeduction> getDeductions(String month, String branchId) {
        return deductionRepository.findByMonthAndBranch(month, branchId);
    }

    // ══════════════════════════════════════════════════════════════════
    // HELPERS
    // ══════════════════════════════════════════════════════════════════

    private BigDecimal calcAbcBonus(String rating) {
        if ("A".equals(rating)) return BigDecimal.valueOf(500_000);
        if ("B".equals(rating)) return BigDecimal.valueOf(200_000);
        return BigDecimal.ZERO;
    }

    private BigDecimal calcTncn(BigDecimal taxableIncome) {
        long x = taxableIncome.longValue();
        long tax;
        if      (x <=  5_000_000) tax = (long)(x * 0.05);
        else if (x <= 10_000_000) tax =  250_000L    + (long)((x -  5_000_000) * 0.10);
        else if (x <= 18_000_000) tax =  750_000L    + (long)((x - 10_000_000) * 0.15);
        else if (x <= 32_000_000) tax =  1_950_000L  + (long)((x - 18_000_000) * 0.20);
        else if (x <= 52_000_000) tax =  4_750_000L  + (long)((x - 32_000_000) * 0.25);
        else if (x <= 80_000_000) tax =  9_750_000L  + (long)((x - 52_000_000) * 0.30);
        else                       tax = 18_150_000L  + (long)((x - 80_000_000) * 0.35);
        return BigDecimal.valueOf(tax);
    }

    private String getCellString(Row row, int col) {
        Cell c = row.getCell(col); if (c == null) return null;
        return switch (c.getCellType()) {
            case STRING  -> c.getStringCellValue().trim();
            case NUMERIC -> String.valueOf((long) c.getNumericCellValue());
            default -> null;
        };
    }

    private BigDecimal getCellDecimal(Row row, int col) {
        Cell c = row.getCell(col); if (c == null) return null;
        if (c.getCellType() == CellType.NUMERIC)
            return BigDecimal.valueOf(c.getNumericCellValue()).setScale(0, RoundingMode.HALF_UP);
        return null;
    }

    private Integer getCellInt(Row row, int col) {
        Cell c = row.getCell(col); if (c == null) return null;
        if (c.getCellType() == CellType.NUMERIC) return (int) c.getNumericCellValue();
        return null;
    }

    private LocalDate getCellDate(Row row, int col) {
        Cell c = row.getCell(col); if (c == null) return null;
        try {
            if (c.getCellType() == CellType.NUMERIC && DateUtil.isCellDateFormatted(c))
                return c.getLocalDateTimeCellValue().toLocalDate();
        } catch (Exception ignored) {}
        return null;
    }
}
