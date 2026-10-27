package com.elitegames.service_tests;

import com.elitegames.entity.Seller;
import com.elitegames.entity.SellerStatus;
import com.elitegames.repository.SellerRepository;
import com.elitegames.service.SellerService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
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

    // =========================================================
    // updateProfile
    // =========================================================

    @Test
    @DisplayName("Should update seller profile fields correctly")
    void updateProfile_correctly() {
        Seller existing = Seller.builder()
                .id(1L)
                .storeName("Old Name")
                .storeSlug("old-slug")
                .taxId("111")
                .bankAccount("0001")
                .status(SellerStatus.PENDING)
                .build();

        when(sellerRepository.findById(1L)).thenReturn(Optional.of(existing));
        when(sellerRepository.findByStoreSlug("new-slug")).thenReturn(Optional.empty());
        when(sellerRepository.save(any(Seller.class))).thenAnswer(i -> i.getArgument(0));

        Seller result = sellerService.updateProfile(
                1L, "New Name", "new-slug", "222", "0002"
        );

        assertEquals("New Name", result.getStoreName());
        assertEquals("new-slug", result.getStoreSlug());
        assertEquals("222", result.getTaxId());
        assertEquals("0002", result.getBankAccount());

        verify(sellerRepository).save(existing);
    }

    @Test
    @DisplayName("Should keep existing fields when null is passed")
    void updateProfile_keepsFieldsWhenNull() {
        Seller existing = Seller.builder()
                .id(1L)
                .storeName("Old Name")
                .storeSlug("old-slug")
                .taxId("111")
                .bankAccount("0001")
                .status(SellerStatus.PENDING)
                .build();

        when(sellerRepository.findById(1L)).thenReturn(Optional.of(existing));
        when(sellerRepository.save(any(Seller.class))).thenAnswer(i -> i.getArgument(0));

        Seller result = sellerService.updateProfile(1L, null, null, null, null);

        assertEquals("Old Name", result.getStoreName());
        assertEquals("old-slug", result.getStoreSlug());
        assertEquals("111", result.getTaxId());
        assertEquals("0001", result.getBankAccount());
    }

    @Test
    @DisplayName("Should throw when updating nonexistent seller")
    void updateProfile_notFound_throws() {
        when(sellerRepository.findById(99L)).thenReturn(Optional.empty());

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> sellerService.updateProfile(99L, "X", "x", null, null));

        assertEquals("Loja não encontrada.", ex.getMessage());
        verify(sellerRepository, never()).save(any());
    }

    @Test
    @DisplayName("Should throw when slug is already used by another seller")
    void updateProfile_slugInUse_throws() {
        Seller existing = Seller.builder().id(1L).storeSlug("old-slug").build();
        Seller other = Seller.builder().id(2L).storeSlug("taken-slug").build();

        when(sellerRepository.findById(1L)).thenReturn(Optional.of(existing));
        when(sellerRepository.findByStoreSlug("taken-slug")).thenReturn(Optional.of(other));

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> sellerService.updateProfile(1L, "X", "taken-slug", null, null));

        assertEquals("Slug já em uso.", ex.getMessage());
        verify(sellerRepository, never()).save(any());
    }

    @Test
    @DisplayName("Should allow keeping the same slug for the same seller")
    void updateProfile_sameSlugSameSeller_allowed() {
        Seller existing = Seller.builder().id(1L).storeSlug("my-slug").build();

        when(sellerRepository.findById(1L)).thenReturn(Optional.of(existing));
        when(sellerRepository.findByStoreSlug("my-slug")).thenReturn(Optional.of(existing));
        when(sellerRepository.save(any(Seller.class))).thenAnswer(i -> i.getArgument(0));

        Seller result = sellerService.updateProfile(1L, "X", "my-slug", null, null);

        assertEquals("my-slug", result.getStoreSlug());
        verify(sellerRepository).save(existing);
    }

    // =========================================================
    // getById
    // =========================================================

    @Test
    @DisplayName("Should return seller by ID")
    void getById_correctly() {
        Seller seller = Seller.builder().id(1L).storeName("Elite Store").build();
        when(sellerRepository.findById(1L)).thenReturn(Optional.of(seller));

        Seller result = sellerService.getById(1L);

        assertEquals("Elite Store", result.getStoreName());
        assertEquals(1L, result.getId());
    }

    @Test
    @DisplayName("Should throw when seller not found by ID")
    void getById_notFound_throws() {
        when(sellerRepository.findById(99L)).thenReturn(Optional.empty());

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> sellerService.getById(99L));

        assertEquals("Loja não encontrada.", ex.getMessage());
    }

    // =========================================================
    // approve
    // =========================================================

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

    // =========================================================
    // reject
    // =========================================================

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

    // =========================================================
    // suspend
    // =========================================================

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

    // =========================================================
    // findByStatus
    // =========================================================

    @Test
    @DisplayName("Should return sellers filtered by status")
    void findByStatus_correctly() {
        List<Seller> pending = List.of(
                Seller.builder().id(1L).status(SellerStatus.PENDING).build(),
                Seller.builder().id(2L).status(SellerStatus.PENDING).build()
        );
        when(sellerRepository.findByStatus(SellerStatus.PENDING)).thenReturn(pending);

        List<Seller> result = sellerService.findByStatus(SellerStatus.PENDING);

        assertEquals(2, result.size());
        assertTrue(result.stream().allMatch(s -> s.getStatus() == SellerStatus.PENDING));
    }

    @Test
    @DisplayName("Should return empty list when no sellers match status")
    void findByStatus_empty() {
        when(sellerRepository.findByStatus(SellerStatus.SUSPENDED)).thenReturn(List.of());

        List<Seller> result = sellerService.findByStatus(SellerStatus.SUSPENDED);

        assertTrue(result.isEmpty());
    }
}