package com.epam.rd.autocode.spring.project.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.math.BigDecimal;

@Getter
@Setter
@Entity
@Table(name = "CLIENTS")
public class Client extends User {

    @Column(name = "balance")
    private BigDecimal balance;
}