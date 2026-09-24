package com.elitegames.repository;

import com.elitegames.entity.Product;
import com.elitegames.service.ProductService;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    List<Product> findByFreelancerId(Long ProductId);
}