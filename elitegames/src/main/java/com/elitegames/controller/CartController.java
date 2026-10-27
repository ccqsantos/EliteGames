package com.elitegames.controller;

import com.elitegames.config.JwtUtil;
import com.elitegames.dto.CartResponse;
import com.elitegames.service.CartService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/cart")
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;
    private final JwtUtil jwtUtil;

    // GET /cart
    @GetMapping
    public ResponseEntity<?> getCart(@RequestHeader("Authorization") String authHeader) {
        try {
            Long customerId = jwtUtil.extractUserId(authHeader.substring(7));
            return ResponseEntity.ok(cartService.getCart(customerId));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // POST /cart/items?productId={id}&quantity={n}
    @PostMapping("/items")
    public ResponseEntity<?> addItem(
            @RequestParam Long productId,
            @RequestParam(defaultValue = "1") int quantity,
            @RequestHeader("Authorization") String authHeader
    ) {
        try {
            Long customerId = jwtUtil.extractUserId(authHeader.substring(7));
            return ResponseEntity.ok(cartService.addItem(customerId, productId, quantity));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // PUT /cart/items/{productId}?quantity={n}
    @PutMapping("/items/{productId}")
    public ResponseEntity<?> updateItem(
            @PathVariable Long productId,
            @RequestParam int quantity,
            @RequestHeader("Authorization") String authHeader
    ) {
        try {
            Long customerId = jwtUtil.extractUserId(authHeader.substring(7));
            return ResponseEntity.ok(cartService.updateQuantity(customerId, productId, quantity));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // DELETE /cart/items/{productId}
    @DeleteMapping("/items/{productId}")
    public ResponseEntity<?> removeItem(
            @PathVariable Long productId,
            @RequestHeader("Authorization") String authHeader
    ) {
        try {
            Long customerId = jwtUtil.extractUserId(authHeader.substring(7));
            return ResponseEntity.ok(cartService.removeItem(customerId, productId));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // DELETE /cart
    @DeleteMapping
    public ResponseEntity<?> clear(@RequestHeader("Authorization") String authHeader) {
        try {
            Long customerId = jwtUtil.extractUserId(authHeader.substring(7));
            return ResponseEntity.ok(cartService.clear(customerId));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}