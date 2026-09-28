package com.elitegames.controller;

import com.elitegames.entity.*;
import com.elitegames.service.OrderService;
import com.elitegames.service.ProductService;
import com.elitegames.service.UserService;
import com.elitegames.config.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;
    private final ProductService productService;
    private final UserService userService;
    private final JwtUtil jwtUtil;

    // POST /orders?productId={id} — cliente autenticado cria um pedido
    @PostMapping
    public ResponseEntity<?> create(
            @RequestParam Long productId,
            @RequestHeader("Authorization") String authHeader
    ) {
        try {
            String token = authHeader.substring(7);
            Long clientId = jwtUtil.extractUserId(token);

            Product product = productService.getById(productId);
            User client = userService.getUserById(clientId);

            if (product.getSeller().getUser().getId().equals(clientId)) {
                return ResponseEntity.badRequest().body("Você não pode comprar seu próprio produto.");
            }

            Order order = orderService.create(product, client);
            return ResponseEntity.ok(order);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // GET /orders/my — lista os pedidos do cliente autenticado
    @GetMapping("/my")
    public ResponseEntity<?> listMyOrders(@RequestHeader("Authorization") String authHeader) {
        try {
            Long clientId = jwtUtil.extractUserId(authHeader.substring(7));
            return ResponseEntity.ok(orderService.findByClientId(clientId));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // GET /orders/received — lista os pedidos recebidos pelo seller autenticado
    @GetMapping("/received")
    public ResponseEntity<?> listReceivedOrders(@RequestHeader("Authorization") String authHeader) {
        try {
            Long userId = jwtUtil.extractUserId(authHeader.substring(7));
            return ResponseEntity.ok(orderService.findBySellerUserId(userId));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // GET /orders/{id}
    @GetMapping("/{id}")
    public ResponseEntity<?> getById(
            @PathVariable Long id,
            @RequestHeader("Authorization") String authHeader
    ) {
        try {
            Long userId = jwtUtil.extractUserId(authHeader.substring(7));
            Order order = orderService.getById(id);

            boolean isClient = order.getClient().getId().equals(userId);
            boolean isSeller = order.getService().getSeller().getUser().getId().equals(userId);

            if (!isClient && !isSeller) {
                return ResponseEntity.status(403).body("Acesso negado.");
            }
            return ResponseEntity.ok(order);
        } catch (RuntimeException e) {
            return ResponseEntity.status(404).body("Pedido não encontrado.");
        }
    }

    // PUT /orders/{id}/status?status={STATUS}
    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(
            @PathVariable Long id,
            @RequestParam OrderStatus status,
            @RequestHeader("Authorization") String authHeader
    ) {
        try {
            Long userId = jwtUtil.extractUserId(authHeader.substring(7));
            Order order = orderService.getById(id);

            boolean isClient = order.getClient().getId().equals(userId);
            boolean isSeller = order.getService().getSeller().getUser().getId().equals(userId);

            if (!isClient && !isSeller) {
                return ResponseEntity.status(403).body("Acesso negado.");
            }

            if (status == OrderStatus.IN_PROGRESS || status == OrderStatus.DELIVERED) {
                if (!isSeller) {
                    return ResponseEntity.status(403).body("Somente o vendedor pode alterar para este status.");
                }
            }

            if (status == OrderStatus.COMPLETED) {
                if (!isClient) {
                    return ResponseEntity.status(403).body("Somente o cliente pode confirmar a conclusão do pedido.");
                }
                if (order.getStatus() != OrderStatus.DELIVERED) {
                    return ResponseEntity.badRequest().body("Apenas pedidos entregues podem ser concluídos.");
                }
            }

            if (status == OrderStatus.CANCELED) {
                if (!isClient) {
                    return ResponseEntity.status(403).body("Somente o cliente pode cancelar o pedido.");
                }
                if (order.getStatus() != OrderStatus.PENDING) {
                    return ResponseEntity.badRequest().body("Apenas pedidos pendentes podem ser cancelados.");
                }
            }

            return ResponseEntity.ok(orderService.updateStatus(id, status));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // DELETE /orders/{id}
    @DeleteMapping("/{id}")
    public ResponseEntity<?> cancelOrder(
            @PathVariable Long id,
            @RequestHeader("Authorization") String authHeader
    ) {
        try {
            Long userId = jwtUtil.extractUserId(authHeader.substring(7));
            Order order = orderService.getById(id);

            if (!order.getClient().getId().equals(userId)) {
                return ResponseEntity.status(403).body("Somente o cliente pode cancelar este pedido.");
            }
            return ResponseEntity.ok(orderService.cancelOrder(id));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // POST /orders/{id}/review
    @PostMapping("/{id}/review")
    public ResponseEntity<?> addReview(
            @PathVariable Long id,
            @RequestBody Map<String, Object> reviewData,
            @RequestHeader("Authorization") String authHeader
    ) {
        try {
            Long userId = jwtUtil.extractUserId(authHeader.substring(7));
            Order order = orderService.getById(id);

            if (!order.getClient().getId().equals(userId)) {
                return ResponseEntity.status(403).body("Apenas o cliente pode avaliar este pedido.");
            }

            Integer rating = (Integer) reviewData.get("rating");
            String comment = (String) reviewData.get("comment");

            return ResponseEntity.ok(orderService.addClientReview(id, rating, comment));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}