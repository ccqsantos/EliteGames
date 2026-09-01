package com.elitegames.controller;

import com.elitegames.dto.FreelancerPreferenceRequest;
import com.elitegames.entity.FreelancerPreferences;
import com.elitegames.service.FreelancerPreferencesService;
import com.elitegames.config.JwtUtil;

import lombok.RequiredArgsConstructor;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/freelancer-preferences")
@RequiredArgsConstructor
public class FreelancerPreferencesController {

    private final FreelancerPreferencesService service;
    private final JwtUtil jwtUtil;

    @PostMapping
    public FreelancerPreferences saveProfile(
            @RequestHeader("Authorization") String authHeader,
            @RequestBody FreelancerPreferenceRequest request
    ) {

        String token = authHeader.substring(7);

        Long userId = jwtUtil.extractUserId(token);

        return service.saveProfile(userId, request);
    }

    @GetMapping
    public FreelancerPreferences getProfile(
            @RequestHeader("Authorization") String authHeader
    ) {

        String token = authHeader.substring(7);

        Long userId = jwtUtil.extractUserId(token);

        return service.getProfile(userId);
    }
}