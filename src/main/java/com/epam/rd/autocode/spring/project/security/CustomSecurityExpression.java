package com.epam.rd.autocode.spring.project.security;

import com.epam.rd.autocode.spring.project.repo.ClientRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service("customSecurity")
@RequiredArgsConstructor
public class CustomSecurityExpression {

    private final ClientRepository clientRepository;

    public boolean isOwner(String targetEmail) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentEmail = authentication.getName();
        return currentEmail.equals(targetEmail);
    }

    public boolean isActive() {
        return true;
    }
}