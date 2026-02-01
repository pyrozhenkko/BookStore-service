package com.epam.rd.autocode.spring.project.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.math.BigDecimal;

@Getter
@Setter
@Entity
@NoArgsConstructor
@Table(name = "CLIENTS")
public class Client extends User {

    @Column(name = "balance")
    private BigDecimal balance;

    public Client(Long id, String name, String email, String password, BigDecimal balance) {
        super(id, email, password, name);
        this.balance = balance;
    }
}