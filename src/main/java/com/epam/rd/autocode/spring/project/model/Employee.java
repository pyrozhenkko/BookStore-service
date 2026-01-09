package com.epam.rd.autocode.spring.project.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDate;

@Getter
@Setter
@Entity
@Table(name = "EMPLOYEES")
public class Employee extends User {

    @Column(name = "phone")
    private String phone;

    @Column(name = "birth_date") // Узгоджено з твоїм SQL скриптом
    private LocalDate birthDate;
}