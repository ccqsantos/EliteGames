package com.elitegames.controller;

import com.elitegames.dto.ClientPreferenceRequest;
import com.elitegames.entity.ClientPreferences;
import com.elitegames.service.ClientPreferencesService;
import com.elitegames.config.JwtUtil;

import lombok.RequiredArgsConstructor;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/client-preferences")
@RequiredArgsConstructor
public class ClientPreferencesController {

    private final ClientPreferencesService service;
    private final JwtUtil jwtUtil;

    @PostMapping
    public ClientPreferences saveProfile(
            @RequestHeader("Authorization") String authHeader,
            @RequestBody ClientPreferenceRequest request
    ) {

        String token = authHeader.substring(7);

        Long userId = jwtUtil.extractUserId(token);

        return service.saveProfile(userId, request);
    }

    @GetMapping
    public ClientPreferences getProfile(
            @RequestHeader("Authorization") String authHeader
    ) {

        String token = authHeader.substring(7);

        Long userId = jwtUtil.extractUserId(token);

        return service.getProfile(userId);
    }
}