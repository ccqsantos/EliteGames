package com.elitegames.dto;

import com.elitegames.entity.Category;
import lombok.Data;

@Data
public class FreelancerPreferenceRequest {

    private String professionalArea;

    private String description;

    private Double averageServicePrice;

    private Integer yearsOfExperience;

    private String availability;

    private String skills;

    private Category category;

    private String portfolioLink;
}