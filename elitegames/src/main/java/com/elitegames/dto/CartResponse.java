package com.elitegames.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

public record CartResponse(
        Long customerId,
        List<CartItemResponse> items,
        BigDecimal subtotal,
        int itemCount,
        Instant updatedAt
) {}