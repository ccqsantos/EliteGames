package com.elitegames.repository;

import com.elitegames.entity.Seller;
import com.elitegames.entity.SellerStatus;
import com.elitegames.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface SellerRepository extends JpaRepository<Seller, Long> {
    Optional<Seller> findByUser(User user);
    Optional<Seller> findByUserId(Long userId);
    List<Seller> findByStatus(SellerStatus status);
}