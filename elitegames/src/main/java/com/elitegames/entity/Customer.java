package com.elitegames.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import tools.jackson.databind.JsonNode;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Builder
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "customer", indexes = @Index(columnList = "email", unique = true))
public class Customer extends User{
    private String firstName;
    private String lastName;
    private String phone;

    private List<Address> addresses;

    private Cart cart;

    private boolean emailOnOrderUpdates = true;
    private boolean emailOnPromotions = false;
    private boolean smsOnShipping = false;

    // Marketing
    private boolean acceptsMarketing = false;

    private JsonNode buildProfile;
}