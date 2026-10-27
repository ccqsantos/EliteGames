package com.elitegames.dto;

import java.math.BigDecimal;
import java.time.Instant;

public record CartItemResponse(
        Long productId,
        Long storeId,
        Integer quantity,
        BigDecimal unitPriceSnapshot,
        String productNameSnapshot,
        String imageUrlSnapshot,
        Instant addedAt
) {}