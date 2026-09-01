package com.elitegames.repository;

import com.elitegames.entity.ClientPreferences;
import com.elitegames.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ClientPreferencesRepository
        extends JpaRepository<ClientPreferences, Long> {

    Optional<ClientPreferences> findByUser(User user);
}