package com.elitegames.dto;

public record PreferencesResponse(
        boolean emailOnOrderUpdates,
        boolean emailOnPromotions,
        boolean smsOnShipping,
        boolean acceptsMarketing
) {
    public static PreferencesResponse from(com.elitegames.entity.Customer c) {
        return new PreferencesResponse(
                c.isEmailOnOrderUpdates(),
                c.isEmailOnPromotions(),
                c.isSmsOnShipping(),
                c.isAcceptsMarketing()
        );
    }
}