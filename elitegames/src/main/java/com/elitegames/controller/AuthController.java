package com.elitegames.controller;

import com.elitegames.dto.LoginRequest;
import com.elitegames.dto.RegisterRequest;
import com.elitegames.repository.UserRepository;
import com.elitegames.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    private final UserRepository userRepository;

    @PostMapping("/register")
    public ResponseEntity<String> register(@RequestBody RegisterRequest request) {
        try {
            String token = authService.register(
                    request.getName(),
                    request.getEmail(),
                    request.getPassword(),
                    request.getRole()
            );
            return ResponseEntity.ok(token);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/login")
    public ResponseEntity<String> login(@RequestBody LoginRequest request) {
        try {
            String token = authService.login(
                    request.getEmail(),
                    request.getPassword()
            );
            return ResponseEntity.ok(token);
        } catch (RuntimeException e) {
            return ResponseEntity.status(401).body("E-mail ou senha inválidos.");
        }
    }
}