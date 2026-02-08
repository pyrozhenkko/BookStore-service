package com.epam.rd.autocode.spring.project.service.impl;

import com.epam.rd.autocode.spring.project.conf.I18nConfig;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.MessageSource;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.*;

@Slf4j
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

    public Map<String, Object> getAllMessages() {
        return getAllMessages(LocaleContextHolder.getLocale());
    }

    public Map<String, Object> getAllMessages(Locale locale) {
        String baseName = "i18n/messages";
        String language = locale.getLanguage();
        String resourceName = "/" + baseName + (language.isEmpty() ? "" : "_" + language) + ".properties";

        log.info("Loading i18n messages from: {} for locale: {}", resourceName, locale);
        Map<String, Object> result = new HashMap<>();

        try (InputStream is = getClass().getResourceAsStream(resourceName)) {
            if (is != null) {
                log.info("Found resource: {}. Loading as UTF-8.", resourceName);
                Properties props = new Properties();
                props.load(new InputStreamReader(is, StandardCharsets.UTF_8));
                for (String key : props.stringPropertyNames()) {
                    unflatten(result, key, props.getProperty(key));
                }
            } else {
                log.warn("Resource {} not found via getResourceAsStream. Falling back to ResourceBundle.",
                        resourceName);
                ResourceBundle bundle = ResourceBundle.getBundle(baseName, locale);
                Enumeration<String> keys = bundle.getKeys();
                while (keys.hasMoreElements()) {
                    String key = keys.nextElement();
                    String value = bundle.getString(key);
                    unflatten(result, key, value);
                }
            }
        } catch (IOException e) {
            log.error("Error loading i18n messages from {}: {}", resourceName, e.getMessage());
        }
        return result;
    }

    @SuppressWarnings("unchecked")
    private void unflatten(Map<String, Object> map, String key, String value) {
        String[] parts = key.split("\\.");
        Map<String, Object> current = map;
        for (int i = 0; i < parts.length - 1; i++) {
            Object next = current.get(parts[i]);
            if (next instanceof Map) {
                current = (Map<String, Object>) next;
            } else {
                Map<String, Object> nextMap = new HashMap<>();
                current.put(parts[i], nextMap);
                current = nextMap;
            }
        }
        current.put(parts[parts.length - 1], value);
    }

    public List<Map<String, String>> getSupportedLanguages() {
        List<Map<String, String>> languages = new ArrayList<>();

        for (Locale locale : I18nConfig.SUPPORTED_LOCALES) {
            Map<String, String> lang = new LinkedHashMap<>();
            lang.put("code", locale.getLanguage());
            lang.put("name", getMessage("language." + locale.getLanguage(), locale));
            languages.add(lang);
        }

        return languages;
    }

    public Locale getCurrentLocale() {
        return LocaleContextHolder.getLocale();
    }
}
