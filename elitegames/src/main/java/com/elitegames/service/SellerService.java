package com.elitegames.service;

import com.elitegames.entity.Seller;
import com.elitegames.entity.SellerStatus;
import com.elitegames.entity.User;
import com.elitegames.repository.SellerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class SellerService {

    private final SellerRepository repository;

    public Seller register(User user, String storeName, String storeSlug, String taxId, String bankAccount) {
        if (repository.findByUser(user).isPresent()) {
            throw new RuntimeException("Este usuário já possui uma loja cadastrada.");
        }

        Seller seller = Seller.builder()
                .user(user)
                .storeName(storeName)
                .storeSlug(storeSlug)
                .taxId(taxId)
                .bankAccount(bankAccount)
                .status(SellerStatus.PENDING)
                .build();

        return repository.save(seller);
    }

    public Seller getByUserId(Long userId) {
        return repository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Loja não encontrada para este usuário."));
    }

    public Seller approve(Long sellerId) {
        Seller seller = getById(sellerId);
        seller.setStatus(SellerStatus.APPROVED);
        seller.setApprovedAt(java.time.LocalDateTime.now());
        return repository.save(seller);
    }

    public Seller suspend(Long sellerId) {
        Seller seller = getById(sellerId);
        seller.setStatus(SellerStatus.SUSPENDED);
        return repository.save(seller);
    }

    public Seller reject(Long sellerId) {
        Seller seller = getById(sellerId);
        seller.setStatus(SellerStatus.REJECTED);
        return repository.save(seller);
    }

    public Seller getById(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Loja não encontrada."));
    }
}