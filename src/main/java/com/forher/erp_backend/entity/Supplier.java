package com.forher.erp_backend.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "SUPPLIER")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Supplier {
    @Id
    @Column(name = "supplier_id", length = 20)
    private String supplierId;

    @Column(name = "supplier_name", length = 200, nullable = false)
    private String supplierName;

    @Column(name = "contact", length = 50)
    private String contact;

    @Column(name = "phone_number", length = 15)
    private String phoneNumber;

    @Column(name = "address", length = 255)
    private String address;

    @Column(name = "email", length = 150)
    private String email;
}