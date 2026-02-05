package com.epam.rd.autocode.spring.project.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.HashSet;
import java.util.Set;

@Getter
@Setter
@Entity
@NoArgsConstructor
@Table(name = "CLIENTS")
public class Client extends User {

    @Column(name = "balance")
    private BigDecimal balance;

    @Column(name = "phone")
    private String phone;

    @Column(name = "registered_date")
    private java.time.LocalDate registeredDate = java.time.LocalDate.now();

    @OneToMany(mappedBy = "client", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<FavoriteItem> favorites = new HashSet<>();

    @OneToMany(mappedBy = "client", cascade = CascadeType.ALL)
    private java.util.List<Order> orders = new java.util.ArrayList<>();

    @Transient
    private int totalOrders;

    public Client(Long id, String name, String email, String password, BigDecimal balance) {
        super(id, email, password, name, false);
        this.balance = balance;
    }
}