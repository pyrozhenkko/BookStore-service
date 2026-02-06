package com.epam.rd.autocode.spring.project.service.impl;

import com.epam.rd.autocode.spring.project.model.Client;
import com.epam.rd.autocode.spring.project.model.Employee;
import com.epam.rd.autocode.spring.project.model.PasswordResetToken;
import com.epam.rd.autocode.spring.project.repo.ClientRepository;
import com.epam.rd.autocode.spring.project.repo.EmployeeRepository;
import com.epam.rd.autocode.spring.project.repo.PasswordResetTokenRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

class PasswordResetServiceTest {

    @Mock
    private PasswordResetTokenRepository tokenRepository;
    @Mock
    private ClientRepository clientRepository;
    @Mock
    private EmployeeRepository employeeRepository;
    @Mock
    private PasswordEncoder passwordEncoder;
    @Mock
    private EmailService emailService;

    @InjectMocks
    private PasswordResetService passwordResetService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void processForgotPassword_UserExists_ShouldSaveTokenAndSendEmail() {
        String email = "user@test.com";
        when(clientRepository.findByEmail(email)).thenReturn(Optional.of(new Client()));
        doNothing().when(emailService).sendPasswordResetEmail(anyString(), anyString());

        passwordResetService.processForgotPassword(email);

        verify(tokenRepository).deleteByEmail(email);
        verify(tokenRepository).save(any(PasswordResetToken.class));
        verify(emailService).sendPasswordResetEmail(eq(email), anyString());
    }

    @Test
    void processForgotPassword_UserNotFound_ShouldDoNothing() {
        String email = "unknown@test.com";
        when(clientRepository.findByEmail(email)).thenReturn(Optional.empty());
        when(employeeRepository.findByEmail(email)).thenReturn(Optional.empty());

        passwordResetService.processForgotPassword(email);

        verify(tokenRepository, never()).save(any());
        verify(emailService, never()).sendPasswordResetEmail(anyString(), anyString());
    }

    @Test
    void resetPassword_ValidToken_ShouldUpdatePassword() {
        String token = "valid-token";
        String newPass = "new-pass";
        PasswordResetToken resetToken = new PasswordResetToken();
        resetToken.setToken(token);
        resetToken.setEmail("client@test.com");
        resetToken.setExpiryDate(LocalDateTime.now().plusHours(1));

        Client client = new Client();
        when(tokenRepository.findByToken(token)).thenReturn(Optional.of(resetToken));
        when(clientRepository.findByEmail("client@test.com")).thenReturn(Optional.of(client));
        when(passwordEncoder.encode(newPass)).thenReturn("encoded-pass");

        passwordResetService.resetPassword(token, newPass);

        assertEquals("encoded-pass", client.getPassword());
        verify(clientRepository).save(client);
        verify(tokenRepository).delete(resetToken);
    }

    @Test
    void resetPassword_ExpiredToken_ShouldThrowException() {
        String token = "expired-token";
        PasswordResetToken resetToken = new PasswordResetToken();
        resetToken.setExpiryDate(LocalDateTime.now().minusHours(1));

        when(tokenRepository.findByToken(token)).thenReturn(Optional.of(resetToken));

        assertThrows(RuntimeException.class, () -> passwordResetService.resetPassword(token, "pass"));
        verify(tokenRepository).delete(resetToken);
    }
}
