package com.elitegames.controller;

import com.elitegames.dto.AddressRequest;
import com.elitegames.dto.PreferencesRequest;
import com.elitegames.dto.PreferencesResponse;
import com.elitegames.entity.Address;
import com.elitegames.entity.Customer;
import com.elitegames.entity.User;
import com.elitegames.repository.CustomerRepository;
import com.elitegames.repository.UserRepository;
import com.elitegames.config.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/profile")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;
    private final CustomerRepository customerRepository;
    private final JwtUtil jwtUtil;

    // =========================================================
    // GET /profile
    // =========================================================
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

    // =========================================================
    // PUT /profile — name, email, phone
    // =========================================================
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

            // phone só existe em Customer
            if (body.containsKey("phone") && user instanceof Customer customer) {
                customer.setPhone(body.get("phone"));
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

            if (emailChanged) {
                String newToken = jwtUtil.generateToken(
                        user.getEmail(), user.getId(), user.getRole().name()
                );
                Map<String, Object> response = new HashMap<>();
                response.put("message", "Perfil atualizado. Use o novo token.");
                response.put("token", newToken);
                response.put("user", user);
                return ResponseEntity.ok(response);
            }

            return ResponseEntity.ok(user);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // =========================================================
    // GET /profile/preferences
    // =========================================================
    @GetMapping("/preferences")
    public ResponseEntity<?> getPreferences(@RequestHeader("Authorization") String authHeader) {
        try {
            Long userId = jwtUtil.extractUserId(authHeader.substring(7));
            Customer customer = customerRepository.findById(userId).orElse(null);

            if (customer == null) {
                return ResponseEntity.status(403)
                        .body("Apenas clientes possuem preferências de compra.");
            }
            return ResponseEntity.ok(PreferencesResponse.from(customer));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // =========================================================
    // PUT /profile/preferences
    // =========================================================
    @PutMapping("/preferences")
    public ResponseEntity<?> updatePreferences(
            @RequestBody PreferencesRequest request,
            @RequestHeader("Authorization") String authHeader
    ) {
        try {
            Long userId = jwtUtil.extractUserId(authHeader.substring(7));
            Customer customer = customerRepository.findById(userId).orElse(null);

            if (customer == null) {
                return ResponseEntity.status(403)
                        .body("Apenas clientes possuem preferências de compra.");
            }

            if (request.emailOnOrderUpdates() != null) {
                customer.setEmailOnOrderUpdates(request.emailOnOrderUpdates());
            }
            if (request.emailOnPromotions() != null) {
                customer.setEmailOnPromotions(request.emailOnPromotions());
            }
            if (request.smsOnShipping() != null) {
                customer.setSmsOnShipping(request.smsOnShipping());
            }
            if (request.acceptsMarketing() != null) {
                customer.setAcceptsMarketing(request.acceptsMarketing());
            }

            customerRepository.save(customer);
            return ResponseEntity.ok(PreferencesResponse.from(customer));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // =========================================================
    // GET /profile/address — lista de endereços do cliente
    // =========================================================
    @GetMapping("/address")
    public ResponseEntity<?> getAddresses(@RequestHeader("Authorization") String authHeader) {
        try {
            Long userId = jwtUtil.extractUserId(authHeader.substring(7));
            Customer customer = customerRepository.findById(userId).orElse(null);

            if (customer == null) {
                return ResponseEntity.status(403).body("Apenas clientes possuem endereço.");
            }

            List<Address> addresses = customer.getAddresses();
            // Se vazio, retorna 204 (No Content) — front trata como "sem endereço"
            if (addresses == null || addresses.isEmpty()) {
                return ResponseEntity.noContent().build();
            }

            return ResponseEntity.ok(addresses);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // =========================================================
    // POST /profile/address — adiciona um novo endereço
    // =========================================================
    @PostMapping("/address")
    @Transactional
    public ResponseEntity<?> addAddress(
            @RequestBody AddressRequest request,
            @RequestHeader("Authorization") String authHeader
    ) {
        try {
            Long userId = jwtUtil.extractUserId(authHeader.substring(7));
            Customer customer = customerRepository.findById(userId).orElse(null);

            if (customer == null) {
                return ResponseEntity.status(403).body("Apenas clientes possuem endereço.");
            }

            String validationError = validateAddress(request);
            if (validationError != null) {
                return ResponseEntity.badRequest().body(validationError);
            }

            Address address = Address.builder()
                    .street(request.street().trim())
                    .number(request.number().trim())
                    .postalCode(request.postalCode().trim())
                    .city(request.city().trim())
                    .state(request.state().trim().toUpperCase())
                    .country(isBlank(request.country()) ? "Brasil" : request.country().trim())
                    .customer(customer)
                    .build();

            if (customer.getAddresses() == null) {
                customer.setAddresses(new java.util.ArrayList<>());
            }
            customer.getAddresses().add(address);
            customerRepository.save(customer);

            return ResponseEntity.ok(address);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // =========================================================
    // PUT /profile/address/{addressId} — atualiza um endereço existente
    // =========================================================
    @PutMapping("/address/{addressId}")
    @Transactional
    public ResponseEntity<?> updateAddress(
            @PathVariable Long addressId,
            @RequestBody AddressRequest request,
            @RequestHeader("Authorization") String authHeader
    ) {
        try {
            Long userId = jwtUtil.extractUserId(authHeader.substring(7));
            Customer customer = customerRepository.findById(userId).orElse(null);

            if (customer == null) {
                return ResponseEntity.status(403).body("Apenas clientes possuem endereço.");
            }

            String validationError = validateAddress(request);
            if (validationError != null) {
                return ResponseEntity.badRequest().body(validationError);
            }

            Address address = customer.getAddresses() == null
                    ? null
                    : customer.getAddresses().stream()
                    .filter(a -> a.getId().equals(addressId))
                    .findFirst()
                    .orElse(null);

            if (address == null) {
                return ResponseEntity.status(404).body("Endereço não encontrado.");
            }

            address.setStreet(request.street().trim());
            address.setNumber(request.number().trim());
            address.setPostalCode(request.postalCode().trim());
            address.setCity(request.city().trim());
            address.setState(request.state().trim().toUpperCase());
            address.setCountry(isBlank(request.country()) ? "Brasil" : request.country().trim());

            customerRepository.save(customer);
            return ResponseEntity.ok(address);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // =========================================================
    // DELETE /profile/address/{addressId}
    // =========================================================
    @DeleteMapping("/address/{addressId}")
    @Transactional
    public ResponseEntity<?> deleteAddress(
            @PathVariable Long addressId,
            @RequestHeader("Authorization") String authHeader
    ) {
        try {
            Long userId = jwtUtil.extractUserId(authHeader.substring(7));
            Customer customer = customerRepository.findById(userId).orElse(null);

            if (customer == null) {
                return ResponseEntity.status(403).body("Apenas clientes possuem endereço.");
            }

            if (customer.getAddresses() == null
                    || customer.getAddresses().removeIf(a -> a.getId().equals(addressId)) == false) {
                return ResponseEntity.status(404).body("Endereço não encontrado.");
            }

            customerRepository.save(customer);
            return ResponseEntity.ok("Endereço removido.");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // =========================================================
    // DELETE /profile
    // =========================================================
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

    // =========================================================
    // POST /profile/upload-photo
    // =========================================================
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

    // =========================================================
    // GET /profile/photo
    // =========================================================
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

    // =========================================================
    // helpers
    // =========================================================
    private boolean isBlank(String s) {
        return s == null || s.trim().isEmpty();
    }

    private String validateAddress(AddressRequest r) {
        if (isBlank(r.street())) return "Rua é obrigatória.";
        if (isBlank(r.number())) return "Número é obrigatório.";
        if (isBlank(r.postalCode())) return "CEP é obrigatório.";
        if (isBlank(r.city())) return "Cidade é obrigatória.";
        if (isBlank(r.state())) return "Estado é obrigatório.";
        return null;
    }
}