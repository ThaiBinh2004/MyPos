package com.forher.erp_backend.entity;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
@Entity
@Table(name = "PAYROLL", uniqueConstraints = @UniqueConstraint(columnNames = {"employee_id", "month"}))
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Payroll {

    @Id
    @Column(name = "payroll_id", length = 40)
    private String payrollId; // PAY-{employeeId}-{YYYY-MM}

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    @Column(name = "month", length = 7) // "YYYY-MM" — nullable để Oracle cho phép add column vào bảng có data
    private String month;

    // Giữ lại để tương thích schema cũ (MONTH_NUM / YEAR_NUM là NOT NULL trong Oracle)
    @Column(name = "month_num", nullable = false)
    @Builder.Default
    private Integer monthNum = 0;

    @Column(name = "year_num", nullable = false)
    @Builder.Default
    private Integer yearNum = 0;

    // ── Ngày công ────────────────────────────────────────────────────
    @Column(name = "work_days")
    @Builder.Default
    private Integer workDays = 0;       // đếm từ attendance

    @Column(name = "leave_days")
    @Builder.Default
    private Integer leaveDays = 0;      // nhập tay (≤ 4 ngày hưởng lương)

    // ── OT (nhập tay) ────────────────────────────────────────────────
    @Column(name = "ot_hours", precision = 6, scale = 2)
    @Builder.Default
    private BigDecimal otHours = BigDecimal.ZERO;

    @Column(name = "ot_holiday_hours", precision = 6, scale = 2)
    @Builder.Default
    private BigDecimal otHolidayHours = BigDecimal.ZERO;

    // ── Lương cơ bản ─────────────────────────────────────────────────
    @Column(name = "base_salary", precision = 15, scale = 2, nullable = false)
    @Builder.Default
    private BigDecimal baseSalary = BigDecimal.ZERO;    // mức lương HĐ

    @Column(name = "base_pay", precision = 15, scale = 2)
    private BigDecimal basePay;                          // thực nhận theo ngày công

    // ── Phụ cấp ──────────────────────────────────────────────────────
    @Column(name = "allowance", precision = 15, scale = 2, nullable = false)
    @Builder.Default
    private BigDecimal allowance = BigDecimal.ZERO;     // phụ cấp HĐ

    @Column(name = "allowance_rate", precision = 3, scale = 2)
    @Builder.Default
    private BigDecimal allowanceRate = BigDecimal.ONE;  // giám đốc điều chỉnh (0.5–1.0)

    @Column(name = "allowance_pay", precision = 15, scale = 2)
    private BigDecimal allowancePay;                    // = allowance * allowanceRate

    // ── OT ───────────────────────────────────────────────────────────
    @Column(name = "overtime_pay", precision = 15, scale = 2, nullable = false)
    @Builder.Default
    private BigDecimal overtimePay = BigDecimal.ZERO;

    // ── Thưởng doanh số (từ Excel import) ────────────────────────────
    @Column(name = "hot_bonus", precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal hotBonus = BigDecimal.ZERO;

    @Column(name = "livestream_bonus", precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal livestreamBonus = BigDecimal.ZERO;

    @Column(name = "sales_bonus", precision = 15, scale = 2, nullable = false)
    @Builder.Default
    private BigDecimal salesBonus = BigDecimal.ZERO;    // = hotBonus + livestreamBonus

    // ── ABC (nhập tay) ───────────────────────────────────────────────
    @Column(name = "abc_rating", length = 1)            // A / B / C
    private String abcRating;

    @Column(name = "abc_bonus", precision = 15, scale = 2, nullable = false)
    @Builder.Default
    private BigDecimal abcBonus = BigDecimal.ZERO;

    // ── Tổng gross ───────────────────────────────────────────────────
    @Column(name = "total_gross", precision = 15, scale = 2)
    private BigDecimal totalGross;

    // ── Khấu trừ ─────────────────────────────────────────────────────
    @Column(name = "bhxh_employee", precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal bhxhEmployee = BigDecimal.ZERO;  // 10.5% lương cơ bản

    @Column(name = "tncn", precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal tncn = BigDecimal.ZERO;

    @Column(name = "advance", precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal advance = BigDecimal.ZERO;        // tạm ứng

    @Column(name = "penalty", precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal penalty = BigDecimal.ZERO;        // phạt

    @Column(name = "deduction", precision = 15, scale = 2, nullable = false)
    @Builder.Default
    private BigDecimal deduction = BigDecimal.ZERO;      // tổng khấu trừ = bhxh+tncn+advance+penalty

    // ── Lương thực nhận ──────────────────────────────────────────────
    @Column(name = "net_salary", precision = 15, scale = 2, nullable = false)
    @Builder.Default
    private BigDecimal netSalary = BigDecimal.ZERO;

    // ── Trạng thái ───────────────────────────────────────────────────
    @Column(name = "status", length = 20, nullable = false)
    @Builder.Default
    private String status = "DRAFT";    // DRAFT / FINALIZED

    @Column(name = "note", length = 500)
    private String note;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "approved_by")
    private Employee approvedBy;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "finalized_at")
    private LocalDateTime finalizedAt;
}
