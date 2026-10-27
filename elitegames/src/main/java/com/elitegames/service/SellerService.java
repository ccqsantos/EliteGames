package com.elitegames.service;

import com.elitegames.entity.Seller;
import com.elitegames.entity.SellerStatus;
import com.elitegames.repository.SellerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SellerService {

    private final SellerRepository repository;

    @Transactional
    public Seller updateProfile(
            Long sellerId,
            String storeName,
            String storeSlug,
            String taxId,
            String bankAccount
    ) {
        Seller seller = getById(sellerId);

        if (storeName != null && !storeName.isBlank()) {
            seller.setStoreName(storeName);
        }
        if (storeSlug != null && !storeSlug.isBlank()) {
            // Garante unicidade do slug (exceto para o próprio seller)
            repository.findByStoreSlug(storeSlug).ifPresent(other -> {
                if (!other.getId().equals(sellerId)) {
                    throw new RuntimeException("Slug já em uso.");
                }
            });
            seller.setStoreSlug(storeSlug);
        }
        if (taxId != null) seller.setTaxId(taxId);
        if (bankAccount != null) seller.setBankAccount(bankAccount);

        return repository.save(seller);
    }

    @Transactional
    public Seller approve(Long sellerId) {
        Seller seller = getById(sellerId);
        seller.setStatus(SellerStatus.APPROVED);
        seller.setApprovedAt(LocalDateTime.now());
        return repository.save(seller);
    }

    @Transactional
    public Seller suspend(Long sellerId) {
        Seller seller = getById(sellerId);
        seller.setStatus(SellerStatus.SUSPENDED);
        return repository.save(seller);
    }

    @Transactional
    public Seller reject(Long sellerId) {
        Seller seller = getById(sellerId);
        seller.setStatus(SellerStatus.REJECTED);
        return repository.save(seller);
    }

    public Seller getById(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Loja não encontrada."));
    }

    public List<Seller> findByStatus(SellerStatus status) {
        return repository.findByStatus(status);
    }
}