package com.elitegames.service_tests;

import com.elitegames.entity.Seller;
import com.elitegames.entity.SellerStatus;
import com.elitegames.entity.User;
import com.elitegames.repository.SellerRepository;
import com.elitegames.service.SellerService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class SellerServiceTest {

    @Mock
    private SellerRepository sellerRepository;

    @InjectMocks
    private SellerService sellerService;

    // ---------- register ----------

    @Test
    @DisplayName("Should register seller correctly")
    void register_correctly() {
        User user = new User();
        user.setId(10L);

        Seller saved = Seller.builder()
                .id(1L)
                .user(user)
                .storeName("Elite Store")
                .storeSlug("elite-store")
                .taxId("12345678000199")
                .bankAccount("0001-12345-6")
                .status(SellerStatus.PENDING)
                .build();

        when(sellerRepository.findByUser(user)).thenReturn(Optional.empty());
        when(sellerRepository.save(any(Seller.class))).thenReturn(saved);

        Seller result = sellerService.register(
                user, "Elite Store", "elite-store",
                "12345678000199", "0001-12345-6"
        );

        assertNotNull(result);
        assertEquals("Elite Store", result.getStoreName());
        assertEquals("elite-store", result.getStoreSlug());
        assertEquals(SellerStatus.PENDING, result.getStatus());

        verify(sellerRepository, times(1)).findByUser(user);
        verify(sellerRepository, times(1)).save(any(Seller.class));
    }

    @Test
    @DisplayName("Should throw when user already has a store")
    void register_userAlreadyHasStore_throws() {
        User user = new User();
        user.setId(10L);

        Seller existing = Seller.builder().id(99L).user(user).build();
        when(sellerRepository.findByUser(user)).thenReturn(Optional.of(existing));

        RuntimeException ex = assertThrows(RuntimeException.class, () ->
                sellerService.register(user, "Elite Store", "elite-store",
                        "12345678000199", "0001-12345-6")
        );

        assertEquals("Este usuário já possui uma loja cadastrada.", ex.getMessage());
        verify(sellerRepository, never()).save(any(Seller.class));
    }

    // ---------- getByUserId ----------

    @Test
    @DisplayName("Should return seller by user ID")
    void getByUserId_correctly() {
        Seller seller = Seller.builder().id(1L).storeName("Elite Store").build();
        when(sellerRepository.findByUserId(10L)).thenReturn(Optional.of(seller));

        Seller result = sellerService.getByUserId(10L);

        assertEquals("Elite Store", result.getStoreName());
    }

    @Test
    @DisplayName("Should throw when seller not found by user ID")
    void getByUserId_notFound_throws() {
        when(sellerRepository.findByUserId(10L)).thenReturn(Optional.empty());

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> sellerService.getByUserId(10L));

        assertEquals("Loja não encontrada para este usuário.", ex.getMessage());
    }

    // ---------- getById ----------

    @Test
    @DisplayName("Should return seller by ID")
    void getById_correctly() {
        Seller seller = Seller.builder().id(1L).storeName("Elite Store").build();
        when(sellerRepository.findById(1L)).thenReturn(Optional.of(seller));

        Seller result = sellerService.getById(1L);

        assertEquals("Elite Store", result.getStoreName());
    }

    @Test
    @DisplayName("Should throw when seller not found by ID")
    void getById_notFound_throws() {
        when(sellerRepository.findById(99L)).thenReturn(Optional.empty());

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> sellerService.getById(99L));

        assertEquals("Loja não encontrada.", ex.getMessage());
    }

    // ---------- approve ----------

    @Test
    @DisplayName("Should approve seller and set approvedAt")
    void approve_correctly() {
        Seller seller = Seller.builder().id(1L).status(SellerStatus.PENDING).build();
        when(sellerRepository.findById(1L)).thenReturn(Optional.of(seller));
        when(sellerRepository.save(any(Seller.class))).thenAnswer(i -> i.getArgument(0));

        Seller result = sellerService.approve(1L);

        assertEquals(SellerStatus.APPROVED, result.getStatus());
        assertNotNull(result.getApprovedAt());
        verify(sellerRepository).save(seller);
    }

    @Test
    @DisplayName("Should throw when approving nonexistent seller")
    void approve_notFound_throws() {
        when(sellerRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> sellerService.approve(99L));

        verify(sellerRepository, never()).save(any());
    }

    // ---------- reject ----------

    @Test
    @DisplayName("Should reject seller correctly")
    void reject_correctly() {
        Seller seller = Seller.builder().id(1L).status(SellerStatus.PENDING).build();
        when(sellerRepository.findById(1L)).thenReturn(Optional.of(seller));
        when(sellerRepository.save(any(Seller.class))).thenAnswer(i -> i.getArgument(0));

        Seller result = sellerService.reject(1L);

        assertEquals(SellerStatus.REJECTED, result.getStatus());
        verify(sellerRepository).save(seller);
    }

    @Test
    @DisplayName("Should throw when rejecting nonexistent seller")
    void reject_notFound_throws() {
        when(sellerRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> sellerService.reject(99L));

        verify(sellerRepository, never()).save(any());
    }

    // ---------- suspend ----------

    @Test
    @DisplayName("Should suspend seller correctly")
    void suspend_correctly() {
        Seller seller = Seller.builder().id(1L).status(SellerStatus.APPROVED).build();
        when(sellerRepository.findById(1L)).thenReturn(Optional.of(seller));
        when(sellerRepository.save(any(Seller.class))).thenAnswer(i -> i.getArgument(0));

        Seller result = sellerService.suspend(1L);

        assertEquals(SellerStatus.SUSPENDED, result.getStatus());
        verify(sellerRepository).save(seller);
    }

    @Test
    @DisplayName("Should throw when suspending nonexistent seller")
    void suspend_notFound_throws() {
        when(sellerRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> sellerService.suspend(99L));

        verify(sellerRepository, never()).save(any());
    }
}