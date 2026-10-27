package com.elitegames.repository;

import com.elitegames.entity.Customer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CustomerRepository extends JpaRepository<Customer, Long> {

    // ---------- lookup básico ----------

    Optional<Customer> findByEmail(String email);

    boolean existsByEmail(String email);

    Optional<Customer> findByPhone(String phone);

    @Query("""
        SELECT DISTINCT c FROM Customer c
        LEFT JOIN FETCH c.cart cart
        LEFT JOIN FETCH cart.items
        WHERE c.id = :id
    """)
    Optional<Customer> findByIdWithCart(@Param("id") Long id);

    @Query("""
        SELECT c FROM Customer c
        LEFT JOIN FETCH c.cart
        WHERE c.id = :id
    """)
    Optional<Customer> findByIdWithCartOnly(@Param("id") Long id);

    // ---------- consultas de domínio ----------

    List<Customer> findByAcceptsMarketingTrue();

    List<Customer> findByEmailOnPromotionsTrue();

    List<Customer> findBySmsOnShippingTrue();

    List<Customer> findByEmailOnOrderUpdatesTrue();

    List<Customer> findByFirstNameContainingIgnoreCaseOrLastNameContainingIgnoreCase(
            String firstName, String lastName);

    long countByAcceptsMarketingTrue();
}