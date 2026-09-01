package com.elitegames.service;

import com.elitegames.dto.FreelancerPreferenceRequest;
import com.elitegames.entity.FreelancerPreferences;
import com.elitegames.entity.User;
import com.elitegames.repository.FreelancerPreferencesRepository;
import com.elitegames.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class FreelancerPreferencesService {

    private final FreelancerPreferencesRepository repository;
    private final UserRepository userRepository;

    public FreelancerPreferences saveProfile(
            Long userId,
            FreelancerPreferenceRequest request
    ) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        FreelancerPreferences profile =
                repository.findByUser(user)
                        .orElse(new FreelancerPreferences());

        profile.setUser(user);
        profile.setProfessionalArea(request.getProfessionalArea());
        profile.setDescription(request.getDescription());
        profile.setAverageServicePrice(request.getAverageServicePrice());
        profile.setYearsOfExperience(request.getYearsOfExperience());
        profile.setAvailability(request.getAvailability());
        profile.setSkills(request.getSkills());
        profile.setCategory(request.getCategory());
        profile.setPortfolioLink(request.getPortfolioLink());

        return repository.save(profile);
    }

    public FreelancerPreferences getProfile(Long userId) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return repository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("Profile not found"));
    }
}