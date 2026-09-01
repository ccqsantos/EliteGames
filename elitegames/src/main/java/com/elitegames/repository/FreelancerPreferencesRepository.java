package com.elitegames.repository;

import com.elitegames.entity.FreelancerPreferences;
import com.elitegames.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface FreelancerPreferencesRepository
        extends JpaRepository<FreelancerPreferences, Long> {

    Optional<FreelancerPreferences> findByUser(User user);
}