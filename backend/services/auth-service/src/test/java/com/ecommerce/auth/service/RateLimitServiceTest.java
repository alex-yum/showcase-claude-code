package com.ecommerce.auth.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.ValueOperations;

import java.time.LocalDateTime;
import java.util.concurrent.TimeUnit;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class RateLimitServiceTest {

    @Mock
    private RedisTemplate<String, Object> redisTemplate;

    @Mock
    private ValueOperations<String, Object> valueOperations;

    private RateLimitService rateLimitService;

    @BeforeEach
    void setUp() {
        when(redisTemplate.opsForValue()).thenReturn(valueOperations);
        rateLimitService = new RateLimitService(redisTemplate);
    }

    @Test
    void shouldIncrementFailedAttemptsOnFirstAttempt() {
        // Given
        String email = "test@example.com";
        when(valueOperations.increment("login:attempts:" + email)).thenReturn(1L);
        when(redisTemplate.hasKey("login:attempts:" + email)).thenReturn(false);

        // When
        rateLimitService.trackFailedAttempt(email);

        // Then
        verify(valueOperations).increment("login:attempts:" + email);
        verify(redisTemplate).expire("login:attempts:" + email, 15, TimeUnit.MINUTES);
        verify(valueOperations, never()).set(startsWith("login:lockout:"), any(), anyLong(), any(TimeUnit.class));
    }

    @Test
    void shouldSetTTLOnFirstFailedAttempt() {
        // Given
        String email = "test@example.com";
        when(valueOperations.increment("login:attempts:" + email)).thenReturn(1L);
        when(redisTemplate.hasKey("login:attempts:" + email)).thenReturn(false);

        // When
        rateLimitService.trackFailedAttempt(email);

        // Then
        verify(redisTemplate).expire("login:attempts:" + email, 15, TimeUnit.MINUTES);
    }

    @Test
    void shouldNotSetTTLOnSubsequentAttempts() {
        // Given
        String email = "test@example.com";
        when(valueOperations.increment("login:attempts:" + email)).thenReturn(2L);
        when(redisTemplate.hasKey("login:attempts:" + email)).thenReturn(true);

        // When
        rateLimitService.trackFailedAttempt(email);

        // Then
        verify(valueOperations).increment("login:attempts:" + email);
        verify(redisTemplate, never()).expire(anyString(), anyLong(), any(TimeUnit.class));
    }

    @Test
    void shouldLockAccountAfterFifthFailedAttempt() {
        // Given
        String email = "test@example.com";
        when(valueOperations.increment("login:attempts:" + email)).thenReturn(5L);

        // When
        rateLimitService.trackFailedAttempt(email);

        // Then
        verify(valueOperations).set(
            eq("login:lockout:" + email),
            any(LocalDateTime.class),
            eq(15L),
            eq(TimeUnit.MINUTES)
        );
    }

    @Test
    void shouldReturnTrueWhenAccountIsLocked() {
        // Given
        String email = "test@example.com";
        when(redisTemplate.hasKey("login:lockout:" + email)).thenReturn(true);

        // When
        boolean isLocked = rateLimitService.isLocked(email);

        // Then
        assertThat(isLocked).isTrue();
    }

    @Test
    void shouldReturnFalseWhenAccountIsNotLocked() {
        // Given
        String email = "test@example.com";
        when(redisTemplate.hasKey("login:lockout:" + email)).thenReturn(false);

        // When
        boolean isLocked = rateLimitService.isLocked(email);

        // Then
        assertThat(isLocked).isFalse();
    }

    @Test
    void shouldClearAttemptsSuccessfully() {
        // Given
        String email = "test@example.com";

        // When
        rateLimitService.clearAttempts(email);

        // Then
        verify(redisTemplate).delete("login:attempts:" + email);
    }

    @Test
    void shouldGetAttemptCount() {
        // Given
        String email = "test@example.com";
        when(valueOperations.get("login:attempts:" + email)).thenReturn(3);

        // When
        int count = rateLimitService.getAttemptCount(email);

        // Then
        assertThat(count).isEqualTo(3);
    }

    @Test
    void shouldReturnZeroWhenNoAttempts() {
        // Given
        String email = "test@example.com";
        when(valueOperations.get("login:attempts:" + email)).thenReturn(null);

        // When
        int count = rateLimitService.getAttemptCount(email);

        // Then
        assertThat(count).isEqualTo(0);
    }
}
