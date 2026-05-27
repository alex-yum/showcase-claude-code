package com.ecommerce.auth.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.ValueOperations;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.concurrent.TimeUnit;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class SessionServiceTest {

    @Mock
    private RedisTemplate<String, Object> redisTemplate;

    @Mock
    private ValueOperations<String, Object> valueOperations;

    private SessionService sessionService;

    @BeforeEach
    void setUp() {
        when(redisTemplate.opsForValue()).thenReturn(valueOperations);
        sessionService = new SessionService(redisTemplate);
    }

    @Test
    void shouldCreateSessionWithAllFields() {
        // Given
        Long userId = 12345L;
        String email = "test@example.com";
        String deviceInfo = "Chrome 120 / Windows 10";
        String ipAddress = "192.168.1.1";
        boolean rememberMe = false;

        // When
        String sessionId = sessionService.createSession(userId, email, deviceInfo, ipAddress, rememberMe);

        // Then
        assertThat(sessionId).isNotNull();
        assertThat(sessionId).isNotEmpty();

        ArgumentCaptor<String> keyCaptor = ArgumentCaptor.forClass(String.class);
        ArgumentCaptor<Map> valueCaptor = ArgumentCaptor.forClass(Map.class);
        ArgumentCaptor<Long> timeoutCaptor = ArgumentCaptor.forClass(Long.class);
        ArgumentCaptor<TimeUnit> timeUnitCaptor = ArgumentCaptor.forClass(TimeUnit.class);

        verify(valueOperations).set(
            keyCaptor.capture(),
            valueCaptor.capture(),
            timeoutCaptor.capture(),
            timeUnitCaptor.capture()
        );

        assertThat(keyCaptor.getValue()).isEqualTo("session:" + sessionId);

        Map<String, Object> sessionData = valueCaptor.getValue();
        assertThat(sessionData.get("userId")).isEqualTo(userId);
        assertThat(sessionData.get("email")).isEqualTo(email);
        assertThat(sessionData.get("deviceInfo")).isEqualTo(deviceInfo);
        assertThat(sessionData.get("ipAddress")).isEqualTo(ipAddress);
        assertThat(sessionData.get("rememberMe")).isEqualTo(rememberMe);
        assertThat(sessionData.get("createdAt")).isInstanceOf(LocalDateTime.class);
        assertThat(sessionData.get("lastActivityAt")).isInstanceOf(LocalDateTime.class);

        assertThat(timeoutCaptor.getValue()).isEqualTo(24L);
        assertThat(timeUnitCaptor.getValue()).isEqualTo(TimeUnit.HOURS);
    }

    @Test
    void shouldCreateSessionWithRememberMeExpiration() {
        // Given
        Long userId = 12345L;
        String email = "test@example.com";
        String deviceInfo = "Chrome 120 / Windows 10";
        String ipAddress = "192.168.1.1";
        boolean rememberMe = true;

        // When
        String sessionId = sessionService.createSession(userId, email, deviceInfo, ipAddress, rememberMe);

        // Then
        assertThat(sessionId).isNotNull();

        ArgumentCaptor<Long> timeoutCaptor = ArgumentCaptor.forClass(Long.class);
        ArgumentCaptor<TimeUnit> timeUnitCaptor = ArgumentCaptor.forClass(TimeUnit.class);

        verify(valueOperations).set(
            anyString(),
            any(),
            timeoutCaptor.capture(),
            timeUnitCaptor.capture()
        );

        assertThat(timeoutCaptor.getValue()).isEqualTo(30L);
        assertThat(timeUnitCaptor.getValue()).isEqualTo(TimeUnit.DAYS);
    }

    @Test
    void shouldGetSessionSuccessfully() {
        // Given
        String sessionId = "test-session-id";
        Map<String, Object> sessionData = Map.of(
            "userId", 12345L,
            "email", "test@example.com",
            "deviceInfo", "Chrome 120 / Windows 10",
            "ipAddress", "192.168.1.1",
            "rememberMe", false,
            "createdAt", LocalDateTime.now(),
            "lastActivityAt", LocalDateTime.now()
        );

        when(valueOperations.get("session:" + sessionId)).thenReturn(sessionData);

        // When
        Map<String, Object> result = sessionService.getSession(sessionId);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.get("userId")).isEqualTo(12345L);
        assertThat(result.get("email")).isEqualTo("test@example.com");
        assertThat(result.get("deviceInfo")).isEqualTo("Chrome 120 / Windows 10");
        assertThat(result.get("ipAddress")).isEqualTo("192.168.1.1");
    }

    @Test
    void shouldReturnNullForNonExistentSession() {
        // Given
        String sessionId = "non-existent-session";
        when(valueOperations.get("session:" + sessionId)).thenReturn(null);

        // When
        Map<String, Object> result = sessionService.getSession(sessionId);

        // Then
        assertThat(result).isNull();
    }

    @Test
    void shouldCheckIfSessionExists() {
        // Given
        String existingSessionId = "existing-session";
        String nonExistingSessionId = "non-existing-session";

        when(redisTemplate.hasKey("session:" + existingSessionId)).thenReturn(true);
        when(redisTemplate.hasKey("session:" + nonExistingSessionId)).thenReturn(false);

        // When
        boolean exists = sessionService.sessionExists(existingSessionId);
        boolean notExists = sessionService.sessionExists(nonExistingSessionId);

        // Then
        assertThat(exists).isTrue();
        assertThat(notExists).isFalse();
    }

    @Test
    void shouldDeleteSessionSuccessfully() {
        // Given
        String sessionId = "test-session-id";

        // When
        sessionService.deleteSession(sessionId);

        // Then
        verify(redisTemplate).delete("session:" + sessionId);
    }

    @Test
    void shouldUpdateLastActivityTimestamp() {
        // Given
        String sessionId = "test-session-id";
        Map<String, Object> sessionData = Map.of(
            "userId", 12345L,
            "email", "test@example.com",
            "deviceInfo", "Chrome 120 / Windows 10",
            "ipAddress", "192.168.1.1",
            "rememberMe", false,
            "createdAt", LocalDateTime.now().minusHours(1),
            "lastActivityAt", LocalDateTime.now().minusMinutes(30)
        );

        when(valueOperations.get("session:" + sessionId)).thenReturn(sessionData);

        // When
        sessionService.updateLastActivity(sessionId);

        // Then
        ArgumentCaptor<String> keyCaptor = ArgumentCaptor.forClass(String.class);
        ArgumentCaptor<Map> valueCaptor = ArgumentCaptor.forClass(Map.class);

        verify(valueOperations).set(keyCaptor.capture(), valueCaptor.capture());

        assertThat(keyCaptor.getValue()).isEqualTo("session:" + sessionId);

        Map<String, Object> updatedData = valueCaptor.getValue();
        assertThat(updatedData.get("userId")).isEqualTo(12345L);
        assertThat(updatedData.get("lastActivityAt")).isInstanceOf(LocalDateTime.class);

        // Verify lastActivityAt is more recent than the original
        LocalDateTime originalLastActivity = (LocalDateTime) sessionData.get("lastActivityAt");
        LocalDateTime updatedLastActivity = (LocalDateTime) updatedData.get("lastActivityAt");
        assertThat(updatedLastActivity).isAfter(originalLastActivity);
    }
}
