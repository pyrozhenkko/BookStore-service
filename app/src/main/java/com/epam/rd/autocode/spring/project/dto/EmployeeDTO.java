package com.epam.rd.autocode.spring.project.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EmployeeDTO {
    private Long id;
    private String email;
    private String password;
    private String name;
    private LocalDate birthDate;
    private String phone;
    private String position;
    private LocalDate hiredDate;
    private boolean isAdmin;
    private boolean isActive;

}