package com.epam.rd.autocode.spring.project.exception;

import com.epam.rd.autocode.spring.project.service.impl.I18nService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;

@Slf4j
@RestControllerAdvice
@RequiredArgsConstructor
public class GlobalExceptionHandler {

    private final I18nService i18nService;

    @ExceptionHandler(NotFoundException.class)
    public ResponseEntity<Map<String, Object>> handleNotFoundException(NotFoundException ex) {
        log.warn("Resource not found: {}", ex.getMessage());
        return buildErrorResponse(
                HttpStatus.NOT_FOUND,
                ex.getMessage() != null ? ex.getMessage() : i18nService.getMessage("error.notFound"));
    }

    @ExceptionHandler(AlreadyExistException.class)
    public ResponseEntity<Map<String, Object>> handleAlreadyExistException(AlreadyExistException ex) {
        log.warn("Resource already exists: {}", ex.getMessage());
        return buildErrorResponse(
                HttpStatus.CONFLICT,
                ex.getMessage() != null ? ex.getMessage() : i18nService.getMessage("error.alreadyExists"));
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, Object>> handleIllegalArgumentException(IllegalArgumentException ex) {
        log.warn("Bad request: {}", ex.getMessage());
        return buildErrorResponse(
                HttpStatus.BAD_REQUEST,
                ex.getMessage() != null ? ex.getMessage() : i18nService.getMessage("error.badRequest"));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleGenericException(Exception ex) {
        log.error("Internal server error: ", ex);
        return buildErrorResponse(
                HttpStatus.INTERNAL_SERVER_ERROR,
                i18nService.getMessage("error.internalError"));
    }

    private ResponseEntity<Map<String, Object>> buildErrorResponse(HttpStatus status, String message) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("timestamp", LocalDateTime.now().toString());
        body.put("status", status.value());
        body.put("error", status.getReasonPhrase());
        body.put("message", message);
        return new ResponseEntity<>(body, status);
    }
}
