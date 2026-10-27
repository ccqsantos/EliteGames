package com.elitegames.repository;

import com.elitegames.entity.Product;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    List<Product> findBySellerId(Long sellerId);

    @EntityGraph(attributePaths = {"images"})
    @Query("SELECT p FROM Product p")
    List<Product> findAllWithImages();
}