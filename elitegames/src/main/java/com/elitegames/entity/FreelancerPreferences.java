package com.elitegames.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

@Table(name = "freelancer_preferences")
@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FreelancerPreferences {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String professionalArea;

    @Column(length = 1000)
    private String description;

    private Double averageServicePrice;

    private Integer yearsOfExperience;

    private String availability;

    private String skills;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.VARCHAR)
    @Column(name = "category")
    private Category category;

    private String portfolioLink;

    @OneToOne
    @JoinColumn(name = "user_id", unique = true)
    @JsonBackReference
    private User user;
}