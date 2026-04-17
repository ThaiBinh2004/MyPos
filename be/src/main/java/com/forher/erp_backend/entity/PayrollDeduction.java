package com.forher.erp_backend.entity;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
@Entity
@Table(name = "PAYROLL_DEDUCTION")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class PayrollDeduction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    @Column(name = "type", length = 20, nullable = false) // ADVANCE / PENALTY
    private String type;

    @Column(name = "amount", precision = 15, scale = 0, nullable = false)
    private BigDecimal amount;

    @Column(name = "reason", length = 500)
    private String reason;

    @Column(name = "deduction_date")
    private LocalDate deductionDate;

    @Column(name = "month", length = 7, nullable = false) // "YYYY-MM"
    private String month;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "approved_by")
    private Employee approvedBy;

    @Column(name = "status", length = 20, nullable = false)
    @Builder.Default
    private String status = "APPROVED"; // APPROVED (tạm ứng/phạt đã xác nhận mới tính vào lương)
}
