package com.elitegames.controller;

import com.elitegames.entity.User;
import com.elitegames.repository.UserRepository;
import com.elitegames.config.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/profile")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;

    // GET /profile — retorna dados do usuário autenticado
    @GetMapping
    public ResponseEntity<?> getCurrentUser(Authentication authentication) {
        try {
            String email = authentication.getName();
            User user = userRepository.findByEmail(email);
            if (user == null) return ResponseEntity.notFound().build();
            return ResponseEntity.ok(user);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // PUT /profile — atualiza nome e e-mail
    @PutMapping
    public ResponseEntity<?> updateProfile(
            @RequestBody Map<String, String> body,
            @RequestHeader("Authorization") String authHeader
    ) {
        try {
            String token = authHeader.substring(7);
            Long userId = jwtUtil.extractUserId(token);

            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("Usuário não encontrado."));

            if (body.containsKey("name") && !body.get("name").isBlank()) {
                user.setName(body.get("name"));
            }

            boolean emailChanged = false;
            if (body.containsKey("email") && !body.get("email").isBlank()) {
                String newEmail = body.get("email");
                if (!newEmail.equals(user.getEmail())) {
                    User existing = userRepository.findByEmail(newEmail);
                    if (existing != null) {
                        return ResponseEntity.badRequest().body("E-mail já está em uso.");
                    }
                    user.setEmail(newEmail);
                    emailChanged = true;
                }
            }

            userRepository.save(user);

            // Se o e-mail mudou, retorna um novo token para o frontend atualizar
            if (emailChanged) {
                String newToken = jwtUtil.generateToken(user.getEmail(), user.getId(), user.getRole().name());
                return ResponseEntity.ok(Map.of(
                        "message", "Perfil atualizado. Use o novo token.",
                        "token", newToken,
                        "user", user
                ));
            }

            return ResponseEntity.ok(user);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // DELETE /profile — exclui a conta do usuário autenticado
    @DeleteMapping
    public ResponseEntity<?> deleteProfile(Authentication authentication) {
        try {
            String email = authentication.getName();
            User user = userRepository.findByEmail(email);
            if (user == null) return ResponseEntity.notFound().build();
            userRepository.delete(user);
            return ResponseEntity.ok("Conta excluída com sucesso.");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // POST /profile/upload-photo — faz upload da foto de perfil
    @PostMapping("/upload-photo")
    public ResponseEntity<?> uploadPhoto(
            @RequestParam("file") MultipartFile file,
            Authentication authentication
    ) {
        try {
            String email = authentication.getName();
            User user = userRepository.findByEmail(email);
            if (user == null) return ResponseEntity.notFound().build();

            user.setProfileImage(file.getBytes());
            user.setProfileImageType(file.getContentType());
            userRepository.save(user);

            return ResponseEntity.ok("Foto enviada com sucesso.");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Erro ao enviar foto.");
        }
    }

    // GET /profile/photo — retorna a foto de perfil
    @GetMapping("/photo")
    public ResponseEntity<byte[]> getProfilePhoto(Authentication authentication) {
        String email = authentication.getName();
        User user = userRepository.findByEmail(email);

        if (user == null || user.getProfileImage() == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(user.getProfileImageType()))
                .body(user.getProfileImage());
    }
}