package com.elitegames.service;

import com.elitegames.config.JwtUtil;
import com.elitegames.entity.Customer;
import com.elitegames.entity.Role;
import com.elitegames.entity.Seller;
import com.elitegames.entity.SellerStatus;
import com.elitegames.entity.User;
import com.elitegames.repository.CustomerRepository;
import com.elitegames.repository.SellerRepository;
import com.elitegames.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final CustomerRepository customerRepository;
    private final SellerRepository sellerRepository;
    private final JwtUtil jwtUtil;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public String register(
            String name,
            String email,
            String password,
            Role role
    ) {
        // ---------- validações comuns ----------
        if (role == null || role == Role.ADMIN) {
            throw new RuntimeException("Tipo de conta inválido.");
        }

        // Email precisa ser único em "user" (Customer) E em "seller"
        if (userRepository.findByEmail(email) != null
                || sellerRepository.findByEmail(email).isPresent()) {
            throw new RuntimeException("Email já cadastrado.");
        }

        String hashedPassword = passwordEncoder.encode(password);

        // ---------- CUSTOMER: herda User ----------
        if (role == Role.CUSTOMER) {
            Customer customer = Customer.builder()
                    .name(name)
                    .email(email)
                    .hash(hashedPassword)
                    .role(Role.CUSTOMER)
                    .emailOnOrderUpdates(true)
                    .emailOnPromotions(false)
                    .smsOnShipping(false)
                    .acceptsMarketing(false)
                    .build();

            Customer saved = customerRepository.save(customer); // "user" + "customer"

            return jwtUtil.generateToken(
                    saved.getEmail(),
                    saved.getId(),
                    saved.getRole().name()
            );
        }

        // ---------- SELLER: entidade independente ----------
        if (role == Role.SELLER) {
            // cnpj é NOT NULL UNIQUE no schema — precisa vir do request.
            // Como o register atual não recebe cnpj, geramos um placeholder
            // TEMPORÁRIO que o seller completa no perfil. Idealmente, adicione
            // `cnpj` ao RegisterRequest e remova o placeholder.
            String placeholderCnpj = "PENDING-" + java.util.UUID.randomUUID();

            Seller seller = Seller.builder()
                    .name(name)
                    .email(email)
                    .hash(hashedPassword)
                    .cnpj(placeholderCnpj)
                    .storeName(name)              // pode ser ajustado depois no perfil
                    .storeSlug(slugify(name, email))
                    .status(SellerStatus.PENDING)
                    .build();

            Seller saved = sellerRepository.save(seller); // só "seller"

            return jwtUtil.generateToken(
                    saved.getEmail(),
                    saved.getId(),                // id do Seller, não de User
                    Role.SELLER.name()
            );
        }

        throw new RuntimeException("Tipo de conta inválido.");
    }

    public String login(String email, String password) {
        // Tenta Customer (que é User) primeiro
        User user = userRepository.findByEmail(email);

        if (user != null) {
            if (!passwordEncoder.matches(password, user.getHash())) {
                throw new RuntimeException("Senha inválida.");
            }
            return jwtUtil.generateToken(
                    user.getEmail(),
                    user.getId(),
                    user.getRole().name()
            );
        }

        // Se não achou em User, tenta Seller
        Seller seller = sellerRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado."));

        if (!passwordEncoder.matches(password, seller.getHash())) {
            throw new RuntimeException("Senha inválida.");
        }

        return jwtUtil.generateToken(
                seller.getEmail(),
                seller.getId(),
                Role.SELLER.name()
        );
    }

    // ---------- helpers ----------

    private String slugify(String storeName, String email) {
        String base = (storeName != null && !storeName.isBlank())
                ? storeName
                : email.split("@")[0];
        String slug = java.text.Normalizer.normalize(base, java.text.Normalizer.Form.NFD)
                .replaceAll("\\p{InCombiningDiacriticalMarks}+", "")
                .toLowerCase()
                .replaceAll("[^a-z0-9]+", "-")
                .replaceAll("^-|-$", "");

        // Garante unicidade do slug
        String candidate = slug;
        int i = 1;
        while (sellerRepository.findByStoreSlug(candidate).isPresent()) {
            candidate = slug + "-" + i++;
        }
        return candidate;
    }
}