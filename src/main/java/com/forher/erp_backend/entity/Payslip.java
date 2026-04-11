package com.forher.erp_backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "PAYSLIP")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Payslip {
    @Id
    @Column(name = "payslip_id", length = 30)
    private String payslipId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "payroll_id", nullable = false)
    private Payroll payroll;

    @Column(name = "issue_date", nullable = false)
    private LocalDate issueDate;

    @Lob
    @Column(name = "salary_detail")
    private String salaryDetail; // Dùng @Lob để lưu chuỗi JSON dài

    @Column(name = "net_amount", precision = 15, scale = 2, nullable = false)
    private BigDecimal netAmount;
}