package com.elitegames.dto;

public record PreferencesRequest(
        Boolean emailOnOrderUpdates,
        Boolean emailOnPromotions,
        Boolean smsOnShipping,
        Boolean acceptsMarketing
) {}