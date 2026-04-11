package com.forher.erp_backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Entity
@Table(name = "PAYROLL")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Payroll {
    @Id
    @Column(name = "payroll_id", length = 30)
    private String payrollId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    @Column(name = "month_num", nullable = false)
    private Integer monthNum;

    @Column(name = "year_num", nullable = false)
    private Integer yearNum;

    @Column(name = "base_salary", precision = 15, scale = 2, nullable = false)
    private BigDecimal baseSalary;

    @Column(name = "allowance", precision = 15, scale = 2, nullable = false)
    private BigDecimal allowance = BigDecimal.ZERO;

    @Column(name = "overtime_pay", precision = 15, scale = 2, nullable = false)
    private BigDecimal overtimePay = BigDecimal.ZERO;

    @Column(name = "sales_bonus", precision = 15, scale = 2, nullable = false)
    private BigDecimal salesBonus = BigDecimal.ZERO;

    @Column(name = "abc_bonus", precision = 15, scale = 2, nullable = false)
    private BigDecimal abcBonus = BigDecimal.ZERO;

    @Column(name = "deduction", precision = 15, scale = 2, nullable = false)
    private BigDecimal deduction = BigDecimal.ZERO;

    @Column(name = "net_salary", precision = 15, scale = 2, nullable = false)
    private BigDecimal netSalary;

    @Column(name = "status", length = 20, nullable = false)
    private String status;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "approved_by")
    private Employee approvedBy;
}