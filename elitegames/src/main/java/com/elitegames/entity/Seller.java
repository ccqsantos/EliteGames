package com.elitegames.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Builder
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "seller")
public class Seller extends User {
    private String storeName;
    private String storeSlug;
    private String taxId;
    private String bankAccount;

    @Enumerated(EnumType.STRING)
    private SellerStatus status;

    private BigDecimal commissionRate;
    private LocalDateTime approvedAt;
}
