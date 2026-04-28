package com.tophat.health.common;

import jakarta.validation.ConstraintViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(NotFoundException.class)
    public ResponseEntity<ApiEnvelope<Map<String, String>>> handleNotFound(NotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                             .body(ApiEnvelope.of(Map.of("error", ex.getMessage())));
    }

    @ExceptionHandler({MethodArgumentNotValidException.class, ConstraintViolationException.class, IllegalArgumentException.class})
    public ResponseEntity<ApiEnvelope<Map<String, Object>>> handleValidation(Exception ex) {
        Map<String, Object> body = new HashMap<>();
        body.put("error", "Validation failed");
        body.put("details", ex.getMessage());
        return ResponseEntity.badRequest()
                             .body(ApiEnvelope.of(body));
    }

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<ApiEnvelope<Map<String, String>>> handleBadCredentials(BadCredentialsException ex) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                             .body(ApiEnvelope.of(Map.of("error", "Invalid username or password")));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiEnvelope<Map<String, String>>> handleGeneric(Exception ex) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                             .body(ApiEnvelope.of(Map.of("error", ex.getMessage())));
    }
}
