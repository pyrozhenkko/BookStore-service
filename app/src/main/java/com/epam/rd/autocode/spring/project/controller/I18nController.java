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
     * GET /api/i18n
     */
    @GetMapping
    public ResponseEntity<Map<String, Object>> getAllTranslations() {
        return ResponseEntity.ok(i18nService.getAllMessages());
    }

    /**
     * GET /api/i18n?lang=en
     */
    @GetMapping(params = "lang")
    public ResponseEntity<Map<String, Object>> getTranslationsByLanguage(@RequestParam("lang") String lang) {
        Locale locale = new Locale(lang);
        return ResponseEntity.ok(i18nService.getAllMessages(locale));
    }

    /**
     * GET /api/i18n/{key}
     */
    @GetMapping("/{key}")
    public ResponseEntity<Map<String, String>> getTranslation(@PathVariable("key") String key) {
        String value = i18nService.getMessage(key);
        return ResponseEntity.ok(Map.of("key", key, "value", value));
    }

    /**
     * GET /api/i18n/languages
     */
    @GetMapping("/languages")
    public ResponseEntity<List<Map<String, String>>> getSupportedLanguages() {
        return ResponseEntity.ok(i18nService.getSupportedLanguages());
    }

    /**
     * GET /api/i18n/current
     */
    @GetMapping("/current")
    public ResponseEntity<Map<String, String>> getCurrentLocale() {
        Locale locale = i18nService.getCurrentLocale();
        return ResponseEntity.ok(Map.of(
                "language", locale.getLanguage(),
                "name", i18nService.getMessage("language." + locale.getLanguage())));
    }
}
