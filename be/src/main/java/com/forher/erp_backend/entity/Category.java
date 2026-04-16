package com.forher.erp_backend.entity;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.*;

@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
@Entity
@Table(name = "CATEGORY")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Category {

    @Id
    @Column(name = "category_id", length = 20)
    private String categoryId;

    @Column(name = "category_name", length = 100, nullable = false)
    private String categoryName;

    @Column(name = "description", length = 255)
    private String description;
}