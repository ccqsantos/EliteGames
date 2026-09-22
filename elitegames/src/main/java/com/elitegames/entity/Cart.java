package com.elitegames.entity;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

public record Cart(
        Long customerId,
        List<CartItem> items,
        Instant updatedAt
) {
    public BigDecimal subtotal() {
        return items.stream()
                .map(i -> i.unitPriceSnapshot().multiply(BigDecimal.valueOf(i.quantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    public int itemCount() {
        return items.stream().mapToInt(CartItem::quantity).sum();
    }
}
