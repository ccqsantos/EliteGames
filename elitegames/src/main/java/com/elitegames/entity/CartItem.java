package com.elitegames.entity;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

public record CartItem(
        Long productId,
        Long storeId,
        Integer quantity,
        BigDecimal unitPriceSnapshot,
        String productNameSnapshot,
        String imageUrlSnapshot,
        Instant addedAt
) {}
