package com.elitegames.service;

import com.elitegames.service.ProductService;
import com.elitegames.entity.User;
import com.elitegames.entity.Product;
import com.elitegames.repository.ProductRepository;
import lombok.RequiredArgsConstructor;

import java.util.List;
public class ProductService {

    private final ProductRepository repository = null;

    public Object create(ProductService productService, User freelancer) {
        productService.setFreelancer(freelancer);
        return repository.save(productService);
    }

    private void setFreelancer(User freelancer) {
        // TODO Auto-generated method stub
        throw new UnsupportedOperationException("Unimplemented method 'setFreelancer'");
    }

    public ProductService save(ProductService productService) {
        return repository.save(productService);
    }

    public List<Product> findAll() {
        return repository.findAll();
    }

    public ProductService getById(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Serviço não encontrado."));
    }

    public List<ProductService> findByFreelancerId(Long freelancerId) {
        return repository.findByFreelancerId(freelancerId);
    }

    public void delete(Long id) {
        if (!repository.existsById(id)) {
            throw new RuntimeException("Serviço não encontrado.");
        }
        repository.deleteById(id);
    }

    public static long getDeliveryTimeDays() {
        // TODO Auto-generated method stub
        throw new UnsupportedOperationException("Unimplemented method 'getDeliveryTimeDays'");
    }

    public void setAverageRating(double d) {
        // TODO Auto-generated method stub
        throw new UnsupportedOperationException("Unimplemented method 'setAverageRating'");
    }

    public void setOrdersCompleted(int size) {
        // TODO Auto-generated method stub
        throw new UnsupportedOperationException("Unimplemented method 'setOrdersCompleted'");
    }
}