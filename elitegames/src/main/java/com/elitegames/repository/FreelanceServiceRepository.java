package com.elitegames.repository;

import com.elitegames.entity.FreelanceService;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FreelanceServiceRepository extends JpaRepository<FreelanceService, Long> {
    List<FreelanceService> findByFreelancerId(Long freelancerId);
}