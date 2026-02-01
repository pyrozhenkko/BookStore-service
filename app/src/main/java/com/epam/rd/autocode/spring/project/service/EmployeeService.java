package com.epam.rd.autocode.spring.project.service;

import com.epam.rd.autocode.spring.project.dto.EmployeeDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;

public interface EmployeeService {

    @PreAuthorize("hasRole('ADMIN')")
    Page<EmployeeDTO> getAllEmployees(Pageable pageable);

    @PreAuthorize("hasRole('ADMIN')")
    Page<EmployeeDTO> searchEmployees(String keyword, Pageable pageable);

    @PreAuthorize("hasRole('ADMIN') or @customSecurity.isEmployeeOwner(#id)")
    EmployeeDTO getEmployeeById(Long id);

    EmployeeDTO getEmployeeByEmail(String email);

    @PreAuthorize("hasRole('ADMIN')")
    EmployeeDTO updateEmployeeById(Long id, EmployeeDTO employee);

    @PreAuthorize("hasRole('ADMIN')")
    void deleteEmployeeById(Long id);

    @PreAuthorize("hasRole('ADMIN')")
    EmployeeDTO addEmployee(EmployeeDTO employee);
}