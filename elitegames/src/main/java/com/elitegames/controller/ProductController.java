package com.elitegames.controller;

import com.elitegames.entity.Product;
import com.elitegames.entity.Seller;
import com.elitegames.entity.SellerStatus;
import com.elitegames.service.ProductService;
import com.elitegames.service.SellerService;
import com.elitegames.config.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;
    private final SellerService sellerService;
    private final JwtUtil jwtUtil;

    // POST /products — cria produto para o seller autenticado (precisa estar APPROVED)
    @PostMapping
    public ResponseEntity<?> create(
            @RequestBody Product product,
            @RequestHeader("Authorization") String authHeader
    ) {
        try {
            Long userId = jwtUtil.extractUserId(authHeader.substring(7));
            Seller seller = sellerService.getByUserId(userId);

            if (seller.getStatus() != SellerStatus.APPROVED) {
                return ResponseEntity.status(403).body("Sua loja ainda não foi aprovada.");
            }

            return ResponseEntity.ok(productService.create(product, seller));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // GET /products
    @GetMapping
    public ResponseEntity<List<Product>> list() {
        return ResponseEntity.ok(productService.findAll());
    }

    // GET /products/{id}
    @GetMapping("/{id}")
    public ResponseEntity<?> getById(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(productService.getById(id));
        } catch (RuntimeException e) {
            return ResponseEntity.status(404).body("Produto não encontrado.");
        }
    }

    // GET /products/my — produtos do seller autenticado
    @GetMapping("/my")
    public ResponseEntity<?> listMyProducts(@RequestHeader("Authorization") String authHeader) {
        try {
            Long userId = jwtUtil.extractUserId(authHeader.substring(7));
            Seller seller = sellerService.getByUserId(userId);
            return ResponseEntity.ok(productService.findBySellerId(seller.getId()));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // PUT /products/{id}
    @PutMapping("/{id}")
    public ResponseEntity<?> update(
            @PathVariable Long id,
            @RequestBody Product updated,
            @RequestHeader("Authorization") String authHeader
    ) {
        try {
            Long userId = jwtUtil.extractUserId(authHeader.substring(7));
            Product existing = productService.getById(id);

            if (!existing.getSeller().getUser().getId().equals(userId)) {
                return ResponseEntity.status(403).body("Você não tem permissão para editar este produto.");
            }

            existing.setTitle(updated.getTitle());
            existing.setDescription(updated.getDescription());
            existing.setPrice(updated.getPrice());
            existing.setCategory(updated.getCategory());
            existing.setStock(updated.getStock());
            existing.setImages(updated.getImages());

            return ResponseEntity.ok(productService.save(existing));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // DELETE /products/{id}
    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(
            @PathVariable Long id,
            @RequestHeader("Authorization") String authHeader
    ) {
        try {
            Long userId = jwtUtil.extractUserId(authHeader.substring(7));
            Product existing = productService.getById(id);

            if (!existing.getSeller().getUser().getId().equals(userId)) {
                return ResponseEntity.status(403).body("Você não tem permissão para excluir este produto.");
            }

            productService.delete(id);
            return ResponseEntity.ok("Produto excluído com sucesso.");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}