package com.elitegames.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import tools.jackson.databind.JsonNode;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@SuperBuilder
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "customer")
public class Customer extends User {
    private String firstName;
    private String lastName;
    private String phone;

    @Transient
    private List<Address> addresses;

    @Transient
    private Cart cart;

    @Builder.Default
    private boolean emailOnOrderUpdates = true;
    @Builder.Default
    private boolean emailOnPromotions = false;
    @Builder.Default
    private boolean smsOnShipping = false;

    @Builder.Default
    private boolean acceptsMarketing = false;

    @Transient
    private JsonNode buildProfile;
}