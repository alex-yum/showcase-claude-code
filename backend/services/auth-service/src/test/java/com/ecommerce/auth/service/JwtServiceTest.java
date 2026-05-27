package com.ecommerce.auth.service;

import com.ecommerce.auth.config.JwtConfig;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.security.SignatureException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.HashMap;
import java.util.Map;

import static org.assertj.core.api.Assertions.*;

class JwtServiceTest {

    private JwtService jwtService;
    private JwtConfig jwtConfig;

    @BeforeEach
    void setUp() {
        jwtConfig = new JwtConfig();
        jwtConfig.setSecret("test-secret-key-minimum-256-bits-required-for-hs256-algorithm");
        jwtConfig.setExpirationMs(3600000L); // 1 hour
        jwtConfig.setRememberMeExpirationMs(86400000L); // 24 hours

        jwtService = new JwtService(jwtConfig);
    }

    @Test
    void shouldGenerateTokenWithUserIdAndEmail() {
        // Given
        Long userId = 12345L;
        String email = "test@example.com";
        String sessionId = "session-uuid";
        boolean rememberMe = false;

        // When
        String token = jwtService.generateToken(userId, email, sessionId, rememberMe);

        // Then
        assertThat(token).isNotNull();
        assertThat(token).isNotEmpty();
        assertThat(token.split("\\.")).hasSize(3); // JWT has 3 parts
    }

    @Test
    void shouldExtractUserIdFromToken() {
        // Given
        Long userId = 12345L;
        String email = "test@example.com";
        String sessionId = "session-uuid";
        String token = jwtService.generateToken(userId, email, sessionId, false);

        // When
        Long extractedUserId = jwtService.extractUserId(token);

        // Then
        assertThat(extractedUserId).isEqualTo(userId);
    }

    @Test
    void shouldExtractEmailFromToken() {
        // Given
        Long userId = 12345L;
        String email = "test@example.com";
        String sessionId = "session-uuid";
        String token = jwtService.generateToken(userId, email, sessionId, false);

        // When
        String extractedEmail = jwtService.extractEmail(token);

        // Then
        assertThat(extractedEmail).isEqualTo(email);
    }

    @Test
    void shouldExtractSessionIdFromToken() {
        // Given
        Long userId = 12345L;
        String email = "test@example.com";
        String sessionId = "session-uuid-123";
        String token = jwtService.generateToken(userId, email, sessionId, false);

        // When
        String extractedSessionId = jwtService.extractSessionId(token);

        // Then
        assertThat(extractedSessionId).isEqualTo(sessionId);
    }

    @Test
    void shouldValidateTokenSuccessfully() {
        // Given
        String token = jwtService.generateToken(12345L, "test@example.com", "session-uuid", false);

        // When
        boolean isValid = jwtService.validateToken(token);

        // Then
        assertThat(isValid).isTrue();
    }

    @Test
    void shouldRejectTokenWithInvalidSignature() {
        // Given
        String token = jwtService.generateToken(12345L, "test@example.com", "session-uuid", false);
        String tamperedToken = token.substring(0, token.length() - 10) + "tampered";

        // When/Then
        assertThatThrownBy(() -> jwtService.validateToken(tamperedToken))
            .isInstanceOf(SignatureException.class);
    }

    @Test
    void shouldGenerateLongerExpirationForRememberMe() {
        // Given
        Long userId = 12345L;
        String email = "test@example.com";
        String sessionId = "session-uuid";

        // When
        String normalToken = jwtService.generateToken(userId, email, sessionId, false);
        String rememberMeToken = jwtService.generateToken(userId, email, sessionId, true);

        long normalExpiration = jwtService.extractExpiration(normalToken);
        long rememberMeExpiration = jwtService.extractExpiration(rememberMeToken);

        // Then
        assertThat(rememberMeExpiration).isGreaterThan(normalExpiration);
    }
}
