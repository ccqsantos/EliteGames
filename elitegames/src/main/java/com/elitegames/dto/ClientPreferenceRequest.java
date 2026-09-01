package com.elitegames.dto;

import lombok.Data;

@Data
public class ClientPreferenceRequest {

    private String companyName;

    private String companyDescription;

    private String hiringArea;

    private String budgetRange;

    private String preferredSkills;

    private String projectType;

    private String workMode;

    private String companyWebsite;
}