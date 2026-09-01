package com.elitegames.controller;

import com.elitegames.entity.*;
import com.elitegames.service.FileUploadService;
import com.elitegames.service.OrderService;
import com.elitegames.service.FreelanceServiceService;
import com.elitegames.service.UserService;
import com.elitegames.config.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;
    private final FreelanceServiceService freelanceServiceService;
    private final UserService userService;
    private final JwtUtil jwtUtil;
    private final FileUploadService fileUploadService;

    // POST /orders?serviceId={id} — cliente autenticado cria um pedido
    @PostMapping
    public ResponseEntity<?> create(
            @RequestParam Long serviceId,
            @RequestHeader("Authorization") String authHeader
    ) {
        try {
            String token = authHeader.substring(7);
            Long clientId = jwtUtil.extractUserId(token);

            FreelanceService freelanceService = freelanceServiceService.getById(serviceId);
            User client = userService.getUserById(clientId);

            // Impede o próprio freelancer de contratar a si mesmo
            if (((FreelanceService) freelanceService).getFreelancer().getId().equals(clientId)) {
                return ResponseEntity.badRequest().body("Você não pode contratar seu próprio serviço.");
            }

            Order order = orderService.create(freelanceService, client);
            return ResponseEntity.ok(order);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // GET /orders/my — lista os pedidos do cliente autenticado
    @GetMapping("/my")
    public ResponseEntity<?> listMyOrders(
            @RequestHeader("Authorization") String authHeader
    ) {
        try {
            String token = authHeader.substring(7);
            Long clientId = jwtUtil.extractUserId(token);
            List<Order> orders = orderService.findByClientId(clientId);
            return ResponseEntity.ok(orders);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // GET /orders/received — lista os pedidos recebidos pelo freelancer autenticado
    @GetMapping("/received")
    public ResponseEntity<?> listReceivedOrders(
            @RequestHeader("Authorization") String authHeader
    ) {
        try {
            String token = authHeader.substring(7);
            Long freelancerId = jwtUtil.extractUserId(token);
            List<Order> orders = orderService.findByFreelancerId(freelancerId);
            return ResponseEntity.ok(orders);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // GET /orders/{id} — retorna um pedido pelo ID
    @GetMapping("/{id}")
    public ResponseEntity<?> getById(
            @PathVariable Long id,
            @RequestHeader("Authorization") String authHeader
    ) {
        try {
            String token = authHeader.substring(7);
            Long userId = jwtUtil.extractUserId(token);
            Order order = orderService.getById(id);

            // Somente o cliente ou o freelancer do pedido podem visualizá-lo
            boolean isClient = order.getClient().getId().equals(userId);
            boolean isFreelancer = order.getService().getFreelancer().getId().equals(userId);

            if (!isClient && !isFreelancer) {
                return ResponseEntity.status(403).body("Acesso negado.");
            }

            return ResponseEntity.ok(order);
        } catch (RuntimeException e) {
            return ResponseEntity.status(404).body("Pedido não encontrado.");
        }
    }

    // PUT /orders/{id}/status?status={STATUS} — atualiza o status do pedido
    // OrderController.java - método updateStatus

    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(
            @PathVariable Long id,
            @RequestParam OrderStatus status,
            @RequestHeader("Authorization") String authHeader
    ) {
        try {
            String token = authHeader.substring(7);
            Long userId = jwtUtil.extractUserId(token);
            Order order = orderService.getById(id);

            boolean isClient = order.getClient().getId().equals(userId);
            boolean isFreelancer = order.getService().getFreelancer().getId().equals(userId);

            if (!isClient && !isFreelancer) {
                return ResponseEntity.status(403).body("Acesso negado.");
            }

            // 🔧 NOVAS REGRAS:
            // - Freelancer pode marcar como IN_PROGRESS ou DELIVERED
            // - Cliente pode marcar como COMPLETED (após receber a entrega) ou CANCELED (apenas se PENDING)

            if (status == OrderStatus.IN_PROGRESS || status == OrderStatus.DELIVERED) {
                if (!isFreelancer) {
                    return ResponseEntity.status(403).body("Somente o freelancer pode alterar para este status.");
                }
            }

            if (status == OrderStatus.COMPLETED) {
                if (!isClient) {
                    return ResponseEntity.status(403).body("Somente o cliente pode confirmar a conclusão do pedido.");
                }
                // Verificar se o pedido está em DELIVERED antes de concluir
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

            Order updated = orderService.updateStatus(id, status);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // DELETE /orders/{id} — cancela/exclui um pedido (somente cliente, apenas se PENDING)
    @DeleteMapping("/{id}")
    public ResponseEntity<?> cancelOrder(
            @PathVariable Long id,
            @RequestHeader("Authorization") String authHeader
    ) {
        try {
            String token = authHeader.substring(7);
            Long userId = jwtUtil.extractUserId(token);
            Order order = orderService.getById(id);

            if (!order.getClient().getId().equals(userId)) {
                return ResponseEntity.status(403).body("Somente o cliente pode cancelar este pedido.");
            }

            Order updated = orderService.cancelOrder(id);
            return ResponseEntity.ok(updated);

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // OrderController.java - Adicione este método

    @GetMapping("/{id}/download")
    public ResponseEntity<?> downloadFile(
            @PathVariable Long id,
            @RequestHeader("Authorization") String authHeader
    ) {
        try {
            String token = authHeader.substring(7);
            Long userId = jwtUtil.extractUserId(token);
            Order order = orderService.getById(id);

            // Verificar se o usuário tem permissão (cliente ou freelancer)
            boolean isClient = order.getClient().getId().equals(userId);
            boolean isFreelancer = order.getService().getFreelancer().getId().equals(userId);

            if (!isClient && !isFreelancer) {
                return ResponseEntity.status(403).body("Acesso negado.");
            }

            if (order.getDeliveryFileUrl() == null) {
                return ResponseEntity.notFound().build();
            }

            Path filePath = Paths.get("." + order.getDeliveryFileUrl());

            if (!Files.exists(filePath)) {
                return ResponseEntity.notFound().build();
            }

            byte[] fileBytes = Files.readAllBytes(filePath);
            String fileName = filePath.getFileName().toString();

            return ResponseEntity.ok()
                    .header("Content-Disposition", "attachment; filename=\"" + fileName + "\"")
                    .contentType(MediaType.APPLICATION_OCTET_STREAM)
                    .body(fileBytes);

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/{id}/deliver")
    public ResponseEntity<?> deliverOrder(
            @PathVariable Long id,
            @RequestParam(value = "message", required = false) String message,
            @RequestParam(value = "file", required = false) MultipartFile file,
            @RequestHeader("Authorization") String authHeader
    ) {
        try {
            String token = authHeader.substring(7);
            Long userId = jwtUtil.extractUserId(token);
            Order order = orderService.getById(id);

            // Verificar se é o freelancer do pedido
            boolean isFreelancer = order.getService().getFreelancer().getId().equals(userId);

            if (!isFreelancer) {
                return ResponseEntity.status(403).body("Apenas o freelancer pode entregar o pedido.");
            }

            String fileUrl = null;

            // Upload do arquivo se existir
            if (file != null && !file.isEmpty()) {
                String subDirectory = "orders/" + id;
                fileUrl = fileUploadService.uploadFile(file, subDirectory);
            }

            // Usar o novo método do service
            Order updated = orderService.deliverOrder(id, message, fileUrl);

            return ResponseEntity.ok(updated);

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/{id}/review")
    public ResponseEntity<?> addReview(
            @PathVariable Long id,
            @RequestBody Map<String, Object> reviewData,
            @RequestHeader("Authorization") String authHeader
    ) {
        try {
            String token = authHeader.substring(7);
            Long userId = jwtUtil.extractUserId(token);
            Order order = orderService.getById(id);

            // Verificar se é o cliente
            if (!order.getClient().getId().equals(userId)) {
                return ResponseEntity.status(403).body("Apenas o cliente pode avaliar este pedido.");
            }

            Integer rating = (Integer) reviewData.get("rating");
            String comment = (String) reviewData.get("comment");

            Order updated = orderService.addClientReview(id, rating, comment);

            return ResponseEntity.ok(updated);

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

}