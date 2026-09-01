package com.elitegames.service;

import com.elitegames.entity.FreelanceService;
import com.elitegames.entity.User;
import com.elitegames.repository.FreelanceServiceRepository;
import lombok.RequiredArgsConstructor;

import java.util.List;

@org.springframework.stereotype.Service
@RequiredArgsConstructor
public class FreelanceServiceService {

    private final FreelanceServiceRepository repository;

    public FreelanceService create(FreelanceService freelanceService, User freelancer) {
        freelanceService.setFreelancer(freelancer);
        return repository.save(freelanceService);
    }

    public FreelanceService save(FreelanceService freelanceService) {
        return repository.save(freelanceService);
    }

    public List<FreelanceService> findAll() {
        return repository.findAll();
    }

    public FreelanceService getById(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Serviço não encontrado."));
    }

    public List<FreelanceService> findByFreelancerId(Long freelancerId) {
        return repository.findByFreelancerId(freelancerId);
    }

    public void delete(Long id) {
        if (!repository.existsById(id)) {
            throw new RuntimeException("Serviço não encontrado.");
        }
        repository.deleteById(id);
    }
}