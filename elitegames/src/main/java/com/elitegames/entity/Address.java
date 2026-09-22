package com.elitegames.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "address")
public class Address {

    @Id
    private Long id;

    @Column
    private String street;

    @Column
    private String number;

    @Column
    private String postalCode;

    @Column
    private String city;

    @Column
    private String state;

    @Column
    private String country;



}
