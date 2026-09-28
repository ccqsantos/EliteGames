package com.elitegames.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;

@Data
@Entity
@Builder
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "\"user\"")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_id", nullable = false)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(unique = true, nullable = false)
    private String email;

    @Transient
    private String password;

    @JsonIgnore
    @Column(nullable = false)
    private String hash;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.VARCHAR)
    private Role role;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(columnDefinition = "BYTEA", name = "profile_image")
    private byte[] profileImage;

    @Column(name = "profile_image_type")
    private String profileImageType;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}