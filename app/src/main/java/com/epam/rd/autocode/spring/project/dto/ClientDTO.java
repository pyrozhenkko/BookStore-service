package com.epam.rd.autocode.spring.project.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ClientDTO {
    private Long id;
    private String email;
    private String password;
    private String name;
    private BigDecimal balance;
    private String phone;
    private java.time.LocalDate registeredDate;
    private int totalOrders;
    private boolean isBlocked;
}