package com.elitegames.dto;

public record AddressRequest(
        String street,
        String number,
        String postalCode,
        String city,
        String state,
        String country
) {}