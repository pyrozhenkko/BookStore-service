package com.epam.rd.autocode.spring.project.service;

import com.epam.rd.autocode.spring.project.dto.EmployeeDTO;
import org.springframework.security.access.prepost.PreAuthorize;
import java.util.List;

public interface EmployeeService {

    @PreAuthorize("hasRole('ADMIN')")
    List<EmployeeDTO> getAllEmployees();

    @PreAuthorize("hasRole('ADMIN') or @customSecurity.isEmployeeOwner(#id)")
    EmployeeDTO getEmployeeById(Long id);

    @PreAuthorize("hasRole('ADMIN')")
    EmployeeDTO updateEmployeeById(Long id, EmployeeDTO employee);

    @PreAuthorize("hasRole('ADMIN')")
    void deleteEmployeeById(Long id);

    @PreAuthorize("hasRole('ADMIN')")
    EmployeeDTO addEmployee(EmployeeDTO employee);

    EmployeeDTO getEmployeeByEmail(String email);
}