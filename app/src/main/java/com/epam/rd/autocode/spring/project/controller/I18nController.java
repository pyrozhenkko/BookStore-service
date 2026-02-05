package com.epam.rd.autocode.spring.project.controller;

import com.epam.rd.autocode.spring.project.service.impl.I18nService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Locale;
import java.util.Map;

@RestController
@RequestMapping("/api/i18n")
@RequiredArgsConstructor
public class I18nController {

    private final I18nService i18nService;

    /**
     * Get all translations for current locale (from Accept-Language header)
     * GET /api/i18n
     */
    @GetMapping
    public ResponseEntity<Map<String, String>> getAllTranslations() {
        return ResponseEntity.ok(i18nService.getAllMessages());
    }

    /**
     * Get all translations for a specific language
     * GET /api/i18n?lang=en
     */
    @GetMapping(params = "lang")
    public ResponseEntity<Map<String, String>> getTranslationsByLanguage(@RequestParam String lang) {
        Locale locale = new Locale(lang);
        return ResponseEntity.ok(i18nService.getAllMessages(locale));
    }

    /**
     * Get a specific translation by key
     * GET /api/i18n/{key}
     */
    @GetMapping("/{key}")
    public ResponseEntity<Map<String, String>> getTranslation(@PathVariable String key) {
        String value = i18nService.getMessage(key);
        return ResponseEntity.ok(Map.of("key", key, "value", value));
    }

    /**
     * Get list of supported languages
     * GET /api/i18n/languages
     */
    @GetMapping("/languages")
    public ResponseEntity<List<Map<String, String>>> getSupportedLanguages() {
        return ResponseEntity.ok(i18nService.getSupportedLanguages());
    }

    /**
     * Get current locale info
     * GET /api/i18n/current
     */
    @GetMapping("/current")
    public ResponseEntity<Map<String, String>> getCurrentLocale() {
        Locale locale = i18nService.getCurrentLocale();
        return ResponseEntity.ok(Map.of(
                "language", locale.getLanguage(),
                "name", i18nService.getMessage("app.language." + locale.getLanguage())));
    }
}
