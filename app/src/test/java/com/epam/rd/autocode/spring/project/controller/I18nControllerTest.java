package com.epam.rd.autocode.spring.project.controller;

import com.epam.rd.autocode.spring.project.repo.ClientRepository;
import com.epam.rd.autocode.spring.project.security.JwtService;
import com.epam.rd.autocode.spring.project.security.OAuth2LoginSuccessHandler;
import com.epam.rd.autocode.spring.project.service.impl.RefreshTokenService;
import com.epam.rd.autocode.spring.project.service.impl.I18nService;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Collections;
import java.util.List;
import java.util.Locale;
import java.util.Map;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest(I18nController.class)
@AutoConfigureMockMvc(addFilters = false)
class I18nControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private I18nService i18nService;

    @MockBean
    private JwtService jwtService;

    @MockBean
    private UserDetailsService userDetailsService;

    @MockBean
    private OAuth2LoginSuccessHandler oAuth2LoginSuccessHandler;

    @MockBean
    private ClientRepository clientRepository;

    @MockBean
    private RefreshTokenService refreshTokenService;

    @Test
    void getAllTranslations_ShouldReturnMap() throws Exception {
        Map<String, Object> messages = Map.of("test", "value");
        when(i18nService.getAllMessages()).thenReturn(messages);

        mockMvc.perform(get("/api/i18n"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.test").value("value"));
    }

    @Test
    void getTranslationsByLanguage_ShouldReturnMapForLocale() throws Exception {
        Map<String, Object> messages = Map.of("test", "value_en");
        when(i18nService.getAllMessages(any(Locale.class))).thenReturn(messages);

        mockMvc.perform(get("/api/i18n").param("lang", "en"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.test").value("value_en"));
    }

    @Test
    void getTranslation_ShouldReturnValue() throws Exception {
        String key = "auth.login";
        String value = "Login";
        when(i18nService.getMessage(key)).thenReturn(value);

        mockMvc.perform(get("/api/i18n/{key}", key))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.key").value(key))
                .andExpect(jsonPath("$.value").value(value));
    }

    @Test
    void getSupportedLanguages_ShouldReturnList() throws Exception {
        Map<String, String> lang = Map.of("code", "en", "name", "English");
        when(i18nService.getSupportedLanguages()).thenReturn(List.of(lang));

        mockMvc.perform(get("/api/i18n/languages"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].code").value("en"))
                .andExpect(jsonPath("$[0].name").value("English"));
    }

    @Test
    void getCurrentLocale_ShouldReturnLocaleInfo() throws Exception {
        Locale locale = Locale.ENGLISH;
        when(i18nService.getCurrentLocale()).thenReturn(locale);
        when(i18nService.getMessage("language.en")).thenReturn("English");

        mockMvc.perform(get("/api/i18n/current"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.language").value("en"))
                .andExpect(jsonPath("$.name").value("English"));
    }
}
