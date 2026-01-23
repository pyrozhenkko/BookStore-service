package com.epam.rd.autocode.spring.project.security;

import com.epam.rd.autocode.spring.project.repo.ClientRepository;
import com.epam.rd.autocode.spring.project.repo.EmployeeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service("customSecurity")
@RequiredArgsConstructor
public class CustomSecurityExpression {

    private final ClientRepository clientRepository;
    private final EmployeeRepository employeeRepository;

    public boolean isClientOwner(Long id) {
        String currentEmail = getCurrentUserEmail();
        return clientRepository.findById(id)
                .map(client -> client.getEmail().equals(currentEmail))
                .orElse(false);
    }

    public boolean isEmployeeOwner(Long id) {
        String currentEmail = getCurrentUserEmail();
        return employeeRepository.findById(id)
                .map(employee -> employee.getEmail().equals(currentEmail))
                .orElse(false);
    }

    private String getCurrentUserEmail() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication.getName();
    }
}