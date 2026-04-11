package com.forher.erp_backend.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "BRANCH")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Branch {

    @Id
    @Column(name = "branch_id", length = 20)
    private String branchId;

    @Column(name = "branch_name", length = 100, nullable = false)
    private String branchName;

    @Column(name = "address", length = 255, nullable = false)
    private String address;

    @Column(name = "total_employee", nullable = false)
    private Integer totalEmployee = 0; // DEFAULT 0
}