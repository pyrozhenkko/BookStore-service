package com.epam.rd.autocode.spring.project.service.impl;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.context.MessageSource;

import java.util.Collections;
import java.util.Locale;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;

class I18nServiceTest {

    @Mock
    private MessageSource messageSource;

    @InjectMocks
    private I18nService i18nService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void getMessage_ShouldReturnMessageFromSource() {
        when(messageSource.getMessage(eq("test.key"), any(), eq("test.key"), any(Locale.class)))
                .thenReturn("Localized Message");

        String result = i18nService.getMessage("test.key");
        assertEquals("Localized Message", result);
    }

    @Test
    void getAllMessages_ShouldReturnNestedMap() {
        // Since getAllMessages loads from real files in its current implementation,
        // we test the unflatten logic via public API if possible or assume properties
        // are present.
        // For unit test, we can mock the behavior if we refactor I18nService to use a
        // loader.
        // But let's test the result map structure for a known key.

        Map<String, Object> messages = i18nService.getAllMessages(Locale.ENGLISH);
        assertNotNull(messages);
        assertTrue(messages.containsKey("auth"));
    }

    @Test
    void getSupportedLanguages_ShouldReturnList() {
        // language.en and language.uk should be mockable if they are fetched via getMessage
        when(messageSource.getMessage(eq("language.en"), any(), anyString(), any(Locale.class)))
                .thenReturn("English");
        when(messageSource.getMessage(eq("language.uk"), any(), anyString(), any(Locale.class)))
                .thenReturn("Ukrainian");

        var languages = i18nService.getSupportedLanguages();
        assertFalse(languages.isEmpty());
        assertEquals("uk", languages.get(0).get("code"));
    }
}
