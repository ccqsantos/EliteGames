package com.elitegames.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "client_preferences")
public class ClientPreferences {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String companyName;

    private String companyDescription;

    private String hiringArea;

    private String budgetRange;

    private String preferredSkills;

    private String projectType;

    private String workMode;

    private String companyWebsite;

    @OneToOne
    @JoinColumn(name = "user_id")
    @JsonBackReference
    private User user;
}