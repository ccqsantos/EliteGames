package com.elitegames.repository;

import com.elitegames.entity.Cart;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface CartRepository extends JpaRepository<Cart, Long> {

    /**
     * Carrega o carrinho com itens + produto + imagens do produto em uma única query.
     * DISTINCT evita duplicação por causa do JOIN em coleção (images).
     */
    @Query("""
        SELECT DISTINCT c FROM Cart c
        LEFT JOIN FETCH c.items i
        LEFT JOIN FETCH i.product p
        LEFT JOIN FETCH p.images
        WHERE c.customer.id = :customerId
    """)

    Optional<Cart> findByCustomerIdWithItems(@Param("customerId") Long customerId);

    Optional<Cart> findByCustomerId(Long customerId);

    boolean existsByCustomerId(Long customerId);
}