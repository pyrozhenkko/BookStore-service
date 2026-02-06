package com.epam.rd.autocode.spring.project.service.impl;

import com.epam.rd.autocode.spring.project.model.RefreshToken;
import com.epam.rd.autocode.spring.project.repo.RefreshTokenRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.Instant;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

class RefreshTokenServiceTest {

    @Mock
    private RefreshTokenRepository refreshTokenRepository;

    @InjectMocks
    private RefreshTokenService refreshTokenService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        ReflectionTestUtils.setField(refreshTokenService, "refreshExpirationMs", 3600000L);
    }

    @Test
    void createRefreshToken_ShouldDeleteOldAndSaveNew() {
        String email = "user@test.com";
        when(refreshTokenRepository.save(any(RefreshToken.class))).thenAnswer(i -> i.getArguments()[0]);

        RefreshToken token = refreshTokenService.createRefreshToken(email);

        assertNotNull(token);
        assertEquals(email, token.getUserEmail());
        verify(refreshTokenRepository).deleteByUserEmail(email);
        verify(refreshTokenRepository).save(any(RefreshToken.class));
    }

    @Test
    void findByToken_ShouldReturnToken() {
        RefreshToken token = new RefreshToken();
        token.setToken("test-token");
        when(refreshTokenRepository.findByToken("test-token")).thenReturn(Optional.of(token));

        RefreshToken result = refreshTokenService.findByToken("test-token");
        assertEquals("test-token", result.getToken());
    }

    @Test
    void verifyExpiration_ValidToken_ShouldReturnToken() {
        RefreshToken token = new RefreshToken();
        token.setExpiryDate(Instant.now().plusSeconds(60));

        RefreshToken result = refreshTokenService.verifyExpiration(token);
        assertEquals(token, result);
    }

    @Test
    void verifyExpiration_ExpiredToken_ShouldThrowException() {
        RefreshToken token = new RefreshToken();
        token.setExpiryDate(Instant.now().minusSeconds(60));

        assertThrows(RuntimeException.class, () -> refreshTokenService.verifyExpiration(token));
        verify(refreshTokenRepository).delete(token);
    }

    @Test
    void deleteByToken_ShouldInvokeDelete() {
        RefreshToken token = new RefreshToken();
        when(refreshTokenRepository.findByToken("token")).thenReturn(Optional.of(token));

        refreshTokenService.deleteByToken("token");
        verify(refreshTokenRepository).delete(token);
    }
}
