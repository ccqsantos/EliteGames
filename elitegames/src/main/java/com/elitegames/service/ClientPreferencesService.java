package com.elitegames.service;

import com.elitegames.dto.ClientPreferenceRequest;
import com.elitegames.entity.ClientPreferences;
import com.elitegames.entity.User;
import com.elitegames.repository.ClientPreferencesRepository;
import com.elitegames.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ClientPreferencesService {

    private final ClientPreferencesRepository repository;
    private final UserRepository userRepository;

    public ClientPreferences saveProfile(
            Long userId,
            ClientPreferenceRequest request
    ) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        ClientPreferences profile =
                repository.findByUser(user)
                        .orElse(new ClientPreferences());

        profile.setUser(user);
        profile.setCompanyName(request.getCompanyName());
        profile.setCompanyDescription(request.getCompanyDescription());
        profile.setHiringArea(request.getHiringArea());
        profile.setBudgetRange(request.getBudgetRange());
        profile.setPreferredSkills(request.getPreferredSkills());
        profile.setProjectType(request.getProjectType());
        profile.setWorkMode(request.getWorkMode());
        profile.setCompanyWebsite(request.getCompanyWebsite());

        return repository.save(profile);
    }

    public ClientPreferences getProfile(Long userId) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return repository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("Profile not found"));
    }
}