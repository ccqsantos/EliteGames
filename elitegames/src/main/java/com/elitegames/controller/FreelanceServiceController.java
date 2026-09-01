package com.elitegames.controller;

import com.elitegames.entity.FreelanceService;
import com.elitegames.entity.User;
import com.elitegames.service.FreelanceServiceService;
import com.elitegames.service.UserService;
import com.elitegames.config.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/services")
@RequiredArgsConstructor
public class FreelanceServiceController {

    private final FreelanceServiceService service;
    private final UserService userService;
    private final JwtUtil jwtUtil;

    // POST /services — cria um novo serviço para o freelancer autenticado
    @PostMapping
    public ResponseEntity<?> create(
            @RequestBody FreelanceService s,
            @RequestHeader("Authorization") String authHeader
    ) {
        try {
            String token = authHeader.substring(7);
            Long userId = jwtUtil.extractUserId(token);
            User freelancer = userService.getUserById(userId);
            FreelanceService created = service.create(s, freelancer);
            return ResponseEntity.ok(created);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // GET /services — lista todos os serviços disponíveis
    @GetMapping
    public ResponseEntity<List<FreelanceService>> list() {
        return ResponseEntity.ok(service.findAll());
    }

    // GET /services/{id} — retorna um serviço pelo ID
    @GetMapping("/{id}")
    public ResponseEntity<?> getById(@PathVariable Long id) {
        try {
            FreelanceService found = service.getById(id);
            return ResponseEntity.ok(found);
        } catch (RuntimeException e) {
            return ResponseEntity.status(404).body("Serviço não encontrado.");
        }
    }

    // GET /services/my — lista os serviços do freelancer autenticado
    @GetMapping("/my")
    public ResponseEntity<?> listMyServices(
            @RequestHeader("Authorization") String authHeader
    ) {
        try {
            String token = authHeader.substring(7);
            Long userId = jwtUtil.extractUserId(token);
            List<FreelanceService> myFreelanceServices = service.findByFreelancerId(userId);
            return ResponseEntity.ok(myFreelanceServices);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // PUT /services/{id} — atualiza um serviço (somente o dono)
    @PutMapping("/{id}")
    public ResponseEntity<?> update(
            @PathVariable Long id,
            @RequestBody FreelanceService updated,
            @RequestHeader("Authorization") String authHeader
    ) {
        try {
            String token = authHeader.substring(7);
            Long userId = jwtUtil.extractUserId(token);
            FreelanceService existing = service.getById(id);

            if (!existing.getFreelancer().getId().equals(userId)) {
                return ResponseEntity.status(403).body("Você não tem permissão para editar este serviço.");
            }

            existing.setTitle(updated.getTitle());
            existing.setDescription(updated.getDescription());
            existing.setPrice(updated.getPrice());
            existing.setCategory(updated.getCategory());
            existing.setDeliveryTimeDays(updated.getDeliveryTimeDays());

            FreelanceService saved = service.save(existing);
            return ResponseEntity.ok(saved);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // DELETE /services/{id} — exclui um serviço (somente o dono)
    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(
            @PathVariable Long id,
            @RequestHeader("Authorization") String authHeader
    ) {
        try {
            String token = authHeader.substring(7);
            Long userId = jwtUtil.extractUserId(token);
            FreelanceService existing = service.getById(id);

            if (!existing.getFreelancer().getId().equals(userId)) {
                return ResponseEntity.status(403).body("Você não tem permissão para excluir este serviço.");
            }

            service.delete(id);
            return ResponseEntity.ok("Serviço excluído com sucesso.");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}