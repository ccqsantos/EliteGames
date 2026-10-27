package com.elitegames.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "seller")
public class Seller {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(unique = true, nullable = false)
    private String email;

    @Transient
    private String password;

    @JsonIgnore
    @Column(nullable = false)
    private String hash;

    @Column(name = "cnpj", unique = true, nullable = false)
    private String cnpj;

    @Column(nullable = false)
    private String storeName;

    @Column(unique = true)
    private String storeSlug;

    private String taxId;

    private String bankAccount;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private SellerStatus status = SellerStatus.PENDING;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    private LocalDateTime approvedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (status == null) status = SellerStatus.PENDING;
    }
}