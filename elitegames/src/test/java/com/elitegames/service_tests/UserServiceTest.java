package com.elitegames.service_tests;

import com.elitegames.entity.User;
import com.elitegames.entity.Role;
import com.elitegames.repository.UserRepository;
import com.elitegames.service.UserService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@Tag("unit")
@ExtendWith(MockitoExtension.class)
public class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private UserService userService;

    private User sampleUser() {
        return User.builder()
                .id(1L)
                .name("Cauã")
                .email("caua@elite.com")
                .role(Role.CUSTOMER) // ajuste conforme seu enum real
                .password("senha123")
                .build();
    }

    // ---------- getAllUsers ----------

    @Test
    @DisplayName("Should return all users")
    void getAllUsers_returnsList() {
        User u1 = User.builder().id(1L).name("A").build();
        User u2 = User.builder().id(2L).name("B").build();
        when(userRepository.findAll()).thenReturn(List.of(u1, u2));

        List<User> result = userService.getAllUsers();

        assertEquals(2, result.size());
        verify(userRepository).findAll();
    }

    @Test
    @DisplayName("Should return empty list when no users")
    void getAllUsers_whenEmpty_returnsEmptyList() {
        when(userRepository.findAll()).thenReturn(List.of());

        List<User> result = userService.getAllUsers();

        assertTrue(result.isEmpty());
    }

    // ---------- getUserById ----------

    @Test
    @DisplayName("Should return user by ID when exists")
    void getUserById_whenExists_returnsUser() {
        User user = sampleUser();
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));

        User result = userService.getUserById(1L);

        assertEquals("Cauã", result.getName());
        assertEquals(1L, result.getId());
    }

    @Test
    @DisplayName("Should throw when user ID not found")
    void getUserById_whenMissing_throws() {
        when(userRepository.findById(99L)).thenReturn(Optional.empty());

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> userService.getUserById(99L));

        assertEquals("User not found with id: 99", ex.getMessage());
    }

    // ---------- getUserByEmail ----------

    @Test
    @DisplayName("Should return user by email when exists")
    void getUserByEmail_whenExists_returnsUser() {
        User user = sampleUser();
        when(userRepository.findByEmail("caua@elite.com")).thenReturn(user);

        User result = userService.getUserByEmail("caua@elite.com");

        assertEquals("caua@elite.com", result.getEmail());
    }

    @Test
    @DisplayName("Should throw when email not found")
    void getUserByEmail_whenMissing_throws() {
        when(userRepository.findByEmail("ghost@elite.com")).thenReturn(null);

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> userService.getUserByEmail("ghost@elite.com"));

        assertEquals("User not found with email: ghost@elite.com", ex.getMessage());
    }

    // ---------- createUser ----------

    @Test
    @DisplayName("Should hash password and save when email is free")
    void createUser_whenEmailFree_hashesAndSaves() {
        User newUser = sampleUser();
        newUser.setId(null); // ainda não persistido

        when(userRepository.findByEmail("caua@elite.com")).thenReturn(null);
        when(passwordEncoder.encode("senha123")).thenReturn("$2a$hashed");
        when(userRepository.save(any(User.class))).thenAnswer(inv -> inv.getArgument(0));

        User result = userService.createUser(newUser);

        assertEquals("$2a$hashed", result.getHash());
        assertNotNull(result.getCreatedAt());

        ArgumentCaptor<User> captor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(captor.capture());
        assertEquals("$2a$hashed", captor.getValue().getHash());
    }

    @Test
    @DisplayName("Should throw when email is already registered")
    void createUser_whenEmailExists_throws() {
        User existing = User.builder().id(2L).email("caua@elite.com").build();
        when(userRepository.findByEmail("caua@elite.com")).thenReturn(existing);

        User newUser = sampleUser();

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> userService.createUser(newUser));

        assertEquals("Email already registered", ex.getMessage());
        verify(passwordEncoder, never()).encode(anyString());
        verify(userRepository, never()).save(any());
    }

    @Test
    @DisplayName("Should not hash when password is empty")
    void createUser_whenPasswordEmpty_skipsHash() {
        User newUser = sampleUser();
        newUser.setPassword(""); // senha vazia

        when(userRepository.findByEmail("caua@elite.com")).thenReturn(null);
        when(userRepository.save(any(User.class))).thenAnswer(inv -> inv.getArgument(0));

        User result = userService.createUser(newUser);

        assertNull(result.getHash());
        verify(passwordEncoder, never()).encode(anyString());
    }

    @Test
    @DisplayName("Should set createdAt on creation")
    void createUser_setsCreatedAt() {
        User newUser = sampleUser();
        when(userRepository.findByEmail("caua@elite.com")).thenReturn(null);
        when(passwordEncoder.encode(anyString())).thenReturn("hash");
        when(userRepository.save(any(User.class))).thenAnswer(inv -> inv.getArgument(0));

        LocalDateTime before = LocalDateTime.now().minusSeconds(1);
        User result = userService.createUser(newUser);
        LocalDateTime after = LocalDateTime.now().plusSeconds(1);

        assertNotNull(result.getCreatedAt());
        assertTrue(result.getCreatedAt().isAfter(before));
        assertTrue(result.getCreatedAt().isBefore(after));
    }

    // ---------- updateUser ----------

    @Test
    @DisplayName("Should update only non-null fields")
    void updateUser_whenPartial_updatesNonNullFields() {
        User existing = sampleUser();
        User patch = User.builder()
                .name("Cauã Silva")
                .email(null)              // não deve sobrescrever
                .role(null)               // não deve sobrescrever
                .build();

        when(userRepository.findById(1L)).thenReturn(Optional.of(existing));
        when(userRepository.save(any(User.class))).thenAnswer(inv -> inv.getArgument(0));

        User result = userService.updateUser(1L, patch);

        assertEquals("Cauã Silva", result.getName());
        assertEquals("caua@elite.com", result.getEmail()); // preservado
        assertEquals(Role.CUSTOMER, result.getRole());       // preservado
    }

    @Test
    @DisplayName("Should update all fields when provided")
    void updateUser_whenFull_updatesEverything() {
        User existing = sampleUser();
        User patch = User.builder()
                .name("Novo Nome")
                .email("novo@elite.com")
                .role(Role.ADMIN) // ajuste conforme seu enum
                .build();

        when(userRepository.findById(1L)).thenReturn(Optional.of(existing));
        when(userRepository.save(any(User.class))).thenAnswer(inv -> inv.getArgument(0));

        User result = userService.updateUser(1L, patch);

        assertEquals("Novo Nome", result.getName());
        assertEquals("novo@elite.com", result.getEmail());
        assertEquals(Role.ADMIN, result.getRole());
    }

    @Test
    @DisplayName("Should throw when updating nonexistent user")
    void updateUser_whenMissing_throws() {
        when(userRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class,
                () -> userService.updateUser(99L, new User()));

        verify(userRepository, never()).save(any());
    }

    // ---------- deleteUser ----------

    @Test
    @DisplayName("Should delete when user exists")
    void deleteUser_whenExists_deletes() {
        when(userRepository.existsById(1L)).thenReturn(true);

        userService.deleteUser(1L);

        verify(userRepository).deleteById(1L);
    }

    @Test
    @DisplayName("Should throw when deleting nonexistent user")
    void deleteUser_whenMissing_throws() {
        when(userRepository.existsById(99L)).thenReturn(false);

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> userService.deleteUser(99L));

        assertEquals("User not found with id: 99", ex.getMessage());
        verify(userRepository, never()).deleteById(any());
    }
}