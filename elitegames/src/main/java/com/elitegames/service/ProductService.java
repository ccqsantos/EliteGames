package com.elitegames.service;

import com.elitegames.entity.Product;
import com.elitegames.entity.Seller;
import com.elitegames.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository repository;

    public Product create(Product product, Seller seller) {
        product.setSeller(seller);
        return repository.save(product);
    }

    public Product save(Product product) {
        return repository.save(product);
    }

    public List<Product> findAll() {
        return repository.findAll();
    }

    public Product getById(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Produto não encontrado."));
    }

    public List<Product> findBySellerId(Long sellerId) {
        return repository.findBySellerId(sellerId);
    }

    public void delete(Long id) {
        if (!repository.existsById(id)) {
            throw new RuntimeException("Produto não encontrado.");
        }
        repository.deleteById(id);
    }
}