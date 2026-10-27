package com.elitegames.controller;

import com.elitegames.entity.Seller;
import com.elitegames.entity.SellerStatus;
import com.elitegames.service.SellerService;
import com.elitegames.service.UserService;
import com.elitegames.config.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/seller")
@RequiredArgsConstructor
public class SellerController {

    private final SellerService sellerService;
    private final UserService userService;
    private final JwtUtil jwtUtil;

    // POST /seller/register — usuário com role SELLER cadastra sua loja
    @PutMapping("/me")
    public ResponseEntity<?> updateMyStore(
            @RequestBody Map<String, String> body,
            @RequestHeader("Authorization") String authHeader
    ) {
        try {
            String role = jwtUtil.extractRole(authHeader.substring(7));
            if (!"SELLER".equals(role)) {
                return ResponseEntity.status(403).body("Apenas contas SELLER.");
            }

            Long sellerId = jwtUtil.extractUserId(authHeader.substring(7));
            Seller updated = sellerService.updateProfile(
                    sellerId,
                    body.get("storeName"),
                    body.get("storeSlug"),
                    body.get("taxId"),
                    body.get("bankAccount")
            );
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // GET /seller/me
    @GetMapping("/me")
    public ResponseEntity<?> me(@RequestHeader("Authorization") String authHeader) {
        try {
            Long sellerId = jwtUtil.extractUserId(authHeader.substring(7)); // para SELLER, é seller.id
            return ResponseEntity.ok(sellerService.getById(sellerId));
        } catch (RuntimeException e) {
            return ResponseEntity.status(404).body(e.getMessage());
        }
    }

    // PUT /seller/{id}/approve — somente ADMIN
    @PutMapping("/{id}/approve")
    public ResponseEntity<?> approve(
            @PathVariable Long id,
            @RequestHeader("Authorization") String authHeader
    ) {
        String role = jwtUtil.extractRole(authHeader.substring(7));
        if (!"ADMIN".equals(role)) {
            return ResponseEntity.status(403).body("Apenas administradores podem aprovar lojas.");
        }
        return ResponseEntity.ok(sellerService.approve(id));
    }

    // PUT /seller/{id}/reject — somente ADMIN
    @PutMapping("/{id}/reject")
    public ResponseEntity<?> reject(
            @PathVariable Long id,
            @RequestHeader("Authorization") String authHeader
    ) {
        String role = jwtUtil.extractRole(authHeader.substring(7));
        if (!"ADMIN".equals(role)) {
            return ResponseEntity.status(403).body("Apenas administradores podem rejeitar lojas.");
        }
        return ResponseEntity.ok(sellerService.reject(id));
    }

    @GetMapping("/pending")
    public ResponseEntity<?> pending(@RequestHeader("Authorization") String authHeader) {
        if (!"ADMIN".equals(jwtUtil.extractRole(authHeader.substring(7)))) {
            return ResponseEntity.status(403).body("Apenas administradores.");
        }
        return ResponseEntity.ok(sellerService.findByStatus(SellerStatus.PENDING));
    }

    @PutMapping("/{id}/suspend")
    public ResponseEntity<?> suspend(@PathVariable Long id,
                                     @RequestHeader("Authorization") String authHeader) {
        if (!"ADMIN".equals(jwtUtil.extractRole(authHeader.substring(7)))) {
            return ResponseEntity.status(403).body("Apenas administradores.");
        }
        return ResponseEntity.ok(sellerService.suspend(id));
    }
}