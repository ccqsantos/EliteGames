package com.elitegames.service_tests;

import com.elitegames.entity.Role;
import com.elitegames.entity.User;
import com.elitegames.repository.UserRepository;
import com.elitegames.service.CustomUserService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@Tag("unit")
@ExtendWith(MockitoExtension.class)
public class CustomUserServiceTest {

    @Mock private UserRepository userRepository;

    @InjectMocks private CustomUserService customUserService;

    @Test
    @DisplayName("loadUserByUsername: should return UserDetails with ROLE_ prefix")
    void loadUserByUsername_whenExists_returnsUserDetails() {
        User user = User.builder()
                .id(1L)
                .email("caua@elite.com")
                .hash("$2a$hashed")
                .role(Role.SELLER)
                .build();

        when(userRepository.findByEmail("caua@elite.com")).thenReturn(user);

        UserDetails result = customUserService.loadUserByUsername("caua@elite.com");

        assertEquals("caua@elite.com", result.getUsername());
        assertEquals("$2a$hashed", result.getPassword());

        assertEquals(1, result.getAuthorities().size());
        GrantedAuthority authority = result.getAuthorities().iterator().next();
        assertEquals("ROLE_SELLER", authority.getAuthority());
    }

    @Test
    @DisplayName("loadUserByUsername: should throw UsernameNotFoundException when missing")
    void loadUserByUsername_whenMissing_throws() {
        when(userRepository.findByEmail("ghost@elite.com")).thenReturn(null);

        UsernameNotFoundException ex = assertThrows(UsernameNotFoundException.class,
                () -> customUserService.loadUserByUsername("ghost@elite.com"));

        assertTrue(ex.getMessage().contains("ghost@elite.com"));
    }

    @Test
    @DisplayName("loadUserByUsername: should map CUSTOMER role with prefix")
    void loadUserByUsername_customerRole_hasCorrectAuthority() {
        User user = User.builder()
                .email("c@e.com")
                .hash("h")
                .role(Role.CUSTOMER)
                .build();
        when(userRepository.findByEmail("c@e.com")).thenReturn(user);

        UserDetails result = customUserService.loadUserByUsername("c@e.com");

        assertEquals("ROLE_CUSTOMER",
                result.getAuthorities().iterator().next().getAuthority());
    }
}