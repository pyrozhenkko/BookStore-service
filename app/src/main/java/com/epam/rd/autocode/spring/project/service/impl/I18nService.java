package com.epam.rd.autocode.spring.project.service.impl;

import com.epam.rd.autocode.spring.project.conf.I18nConfig;
import lombok.RequiredArgsConstructor;
import org.springframework.context.MessageSource;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.*;

@Service
@RequiredArgsConstructor
public class I18nService {

    private final MessageSource messageSource;

    public String getMessage(String key) {
        return messageSource.getMessage(key, null, key, LocaleContextHolder.getLocale());
    }

    public String getMessage(String key, Object... args) {
        return messageSource.getMessage(key, args, key, LocaleContextHolder.getLocale());
    }

    public String getMessage(String key, Locale locale) {
        return messageSource.getMessage(key, null, key, locale);
    }

    public Map<String, String> getAllMessages() {
        return getAllMessages(LocaleContextHolder.getLocale());
    }

    public Map<String, String> getAllMessages(Locale locale) {
        ResourceBundle bundle = ResourceBundle.getBundle("i18n/messages", locale);
        Map<String, String> messages = new HashMap<>();
        Enumeration<String> keys = bundle.getKeys();
        while (keys.hasMoreElements()) {
            String key = keys.nextElement();
            messages.put(key, bundle.getString(key));
        }
        return messages;
    }

    public List<Map<String, String>> getSupportedLanguages() {
        List<Map<String, String>> languages = new ArrayList<>();

        for (Locale locale : I18nConfig.SUPPORTED_LOCALES) {
            Map<String, String> lang = new LinkedHashMap<>();
            lang.put("code", locale.getLanguage());
            lang.put("name", getMessage("app.language." + locale.getLanguage(), locale));
            languages.add(lang);
        }

        return languages;
    }

    public Locale getCurrentLocale() {
        return LocaleContextHolder.getLocale();
    }
}
