package com.epam.rd.autocode.spring.project.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "EMPLOYEES")
public class Employee extends User {

    @Column(name = "phone")
    private String phone;

    @Column(name = "birth_date")
    private LocalDate birthDate;

    @Column(name = "position")
    private String position;

    @Column(name = "hired_date")
    private LocalDate hiredDate = LocalDate.now();

    @Column(name = "is_admin", nullable = false, columnDefinition = "boolean default false")
    private boolean isAdmin = false;

    public Employee(Long id, String name, String email, String password, String phone, LocalDate birthDate) {
        super(id, email, password, name, false);
        this.phone = phone;
        this.birthDate = birthDate;
    }
}