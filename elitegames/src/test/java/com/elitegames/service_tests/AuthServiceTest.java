package com.elitegames.service_tests;

import com.elitegames.config.JwtUtil;
import com.elitegames.entity.Role;
import com.elitegames.entity.User;
import com.elitegames.repository.UserRepository;
import com.elitegames.service.AuthService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@Tag("unit")
@ExtendWith(MockitoExtension.class)
public class AuthServiceTest {

    @Mock private UserRepository userRepository;
    @Mock private JwtUtil jwtUtil;
    @Mock private PasswordEncoder passwordEncoder;

    @InjectMocks private AuthService authService;

    // ---------- register ----------

    @Test
    @DisplayName("register: should hash password, save user and return token")
    void register_whenEmailFree_hashesSavesAndReturnsToken() {
        when(userRepository.findByEmail("caua@elite.com")).thenReturn(null);
        when(passwordEncoder.encode("senha123")).thenReturn("$2a$hashed");
        when(userRepository.save(any(User.class))).thenAnswer(inv -> {
            User u = inv.getArgument(0);
            u.setId(1L); // simula o ID gerado pelo banco
            return u;
        });
        when(jwtUtil.generateToken(eq("caua@elite.com"), eq(1L), eq("CUSTOMER")))
                .thenReturn("jwt-token");

        String token = authService.register("Cauã", "caua@elite.com", "senha123", Role.CUSTOMER);

        assertEquals("jwt-token", token);

        ArgumentCaptor<User> captor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(captor.capture());
        User saved = captor.getValue();

        assertEquals("Cauã", saved.getName());
        assertEquals("caua@elite.com", saved.getEmail());
        assertEquals("$2a$hashed", saved.getHash());
        assertEquals(Role.CUSTOMER, saved.getRole());
        verify(passwordEncoder).encode("senha123");
        verify(jwtUtil).generateToken("caua@elite.com", 1L, "CUSTOMER");
    }

    @Test
    @DisplayName("register: should throw when email already registered")
    void register_whenEmailExists_throws() {
        when(userRepository.findByEmail("caua@elite.com"))
                .thenReturn(User.builder().id(2L).email("caua@elite.com").build());

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> authService.register("Cauã", "caua@elite.com", "senha123", Role.CUSTOMER));

        assertEquals("Email já cadastrado.", ex.getMessage());
        verify(passwordEncoder, never()).encode(anyString());
        verify(userRepository, never()).save(any());
        verify(jwtUtil, never()).generateToken(any(), any(), any());
    }

    // ---------- login ----------

    @Test
    @DisplayName("login: should return token when credentials are valid")
    void login_whenValid_returnsToken() {
        User user = User.builder()
                .id(1L)
                .email("caua@elite.com")
                .hash("$2a$hashed")
                .role(Role.CUSTOMER)
                .build();

        when(userRepository.findByEmail("caua@elite.com")).thenReturn(user);
        when(passwordEncoder.matches("senha123", "$2a$hashed")).thenReturn(true);
        when(jwtUtil.generateToken("caua@elite.com", 1L, "CUSTOMER")).thenReturn("jwt-token");

        String token = authService.login("caua@elite.com", "senha123");

        assertEquals("jwt-token", token);
        verify(passwordEncoder).matches("senha123", "$2a$hashed");
        verify(jwtUtil).generateToken("caua@elite.com", 1L, "CUSTOMER");
    }

    @Test
    @DisplayName("login: should throw when user not found")
    void login_whenUserMissing_throws() {
        when(userRepository.findByEmail("ghost@elite.com")).thenReturn(null);

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> authService.login("ghost@elite.com", "any"));

        assertEquals("Usuário não encontrado.", ex.getMessage());
        verify(passwordEncoder, never()).matches(anyString(), anyString());
        verify(jwtUtil, never()).generateToken(any(), any(), any());
    }

    @Test
    @DisplayName("login: should throw when password does not match")
    void login_whenPasswordWrong_throws() {
        User user = User.builder()
                .id(1L)
                .email("caua@elite.com")
                .hash("$2a$hashed")
                .role(Role.CUSTOMER)
                .build();

        when(userRepository.findByEmail("caua@elite.com")).thenReturn(user);
        when(passwordEncoder.matches("errada", "$2a$hashed")).thenReturn(false);

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> authService.login("caua@elite.com", "errada"));

        assertEquals("Senha inválida.", ex.getMessage());
        verify(jwtUtil, never()).generateToken(any(), any(), any());
    }
}