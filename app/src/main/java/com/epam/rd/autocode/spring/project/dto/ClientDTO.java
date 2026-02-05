package com.epam.rd.autocode.spring.project.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
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

    @JsonProperty("isBlocked")
    private boolean isBlocked;
}