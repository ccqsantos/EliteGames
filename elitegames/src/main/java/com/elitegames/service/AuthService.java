package com.elitegames.service;

import com.elitegames.config.JwtUtil;
import com.elitegames.entity.Role;
import com.elitegames.entity.User;
import com.elitegames.repository.UserRepository;

import lombok.RequiredArgsConstructor;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;

    /*
     * Usando o PasswordEncoder do Spring.
     * Isso evita inconsistência de hash.
     */
    private final PasswordEncoder passwordEncoder;

    public String register(
            String name,
            String email,
            String password,
            Role role
    ) {

        /*
         * Evita registrar email duplicado
         */
        User existingUser = userRepository.findByEmail(email);

        if (existingUser != null) {
            throw new RuntimeException("Email já cadastrado.");
        }

        /*
         * Criptografa a senha antes de salvar
         */
        String hashedPassword =
                passwordEncoder.encode(password);

        User user = User.builder()
                .name(name)
                .email(email)
                .hash(hashedPassword)
                .role(role)
                .build();

        userRepository.save(user);

        /*
         * IMPORTANTE:
         * Agora o token é gerado usando EMAIL
         * como subject.
         *
         * O JwtAuthenticationFilter espera email.
         *
         * Isso resolve o erro 403.
         */
        return jwtUtil.generateToken(
                user.getEmail(),
                user.getId(),
                user.getRole().name()
        );
    }

    public String login(
            String email,
            String password
    ) {

        User user = userRepository.findByEmail(email);

        /*
         * Evita NullPointerException
         */
        if (user == null) {
            throw new RuntimeException(
                    "Usuário não encontrado."
            );
        }

        /*
         * Verifica senha
         */
        boolean passwordMatches =
                passwordEncoder.matches(
                        password,
                        user.getHash()
                );

        if (!passwordMatches) {
            throw new RuntimeException(
                    "Senha inválida."
            );
        }

        /*
         * Gera token JWT padronizado
         */
        return jwtUtil.generateToken(
                user.getEmail(),
                user.getId(),
                user.getRole().name()
        );
    }
}