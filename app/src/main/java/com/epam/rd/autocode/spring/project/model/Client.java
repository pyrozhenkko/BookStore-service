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

    @OneToMany(mappedBy = "client", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<FavoriteItem> favorites = new HashSet<>();

    public Client(Long id, String name, String email, String password, BigDecimal balance) {
        super(id, email, password, name);
        this.balance = balance;
    }
}