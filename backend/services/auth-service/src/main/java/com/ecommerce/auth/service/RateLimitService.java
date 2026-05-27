package com.ecommerce.auth.service;

import com.ecommerce.auth.constants.RateLimitConstants;
import com.ecommerce.auth.constants.RedisKeys;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.concurrent.TimeUnit;

@Service
public class RateLimitService {

    private final RedisTemplate<String, Object> redisTemplate;

    public RateLimitService(RedisTemplate<String, Object> redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    public void trackFailedAttempt(String email) {
        String attemptsKey = RedisKeys.LOGIN_ATTEMPTS_PREFIX + email;

        // Check if this is the first attempt (key doesn't exist)
        boolean isFirstAttempt = Boolean.FALSE.equals(redisTemplate.hasKey(attemptsKey));

        // Increment the attempt counter
        Long attempts = redisTemplate.opsForValue().increment(attemptsKey);

        // Set TTL only on first attempt
        if (isFirstAttempt) {
            redisTemplate.expire(attemptsKey, RateLimitConstants.LOCKOUT_DURATION_MINUTES, TimeUnit.MINUTES);
        }

        // Lock account if max attempts reached
        if (attempts != null && attempts >= RateLimitConstants.MAX_ATTEMPTS) {
            lockAccount(email);
        }
    }

    public boolean isLocked(String email) {
        String lockoutKey = RedisKeys.LOGIN_LOCKOUT_PREFIX + email;
        Boolean hasKey = redisTemplate.hasKey(lockoutKey);
        return hasKey != null && hasKey;
    }

    public void clearAttempts(String email) {
        String attemptsKey = RedisKeys.LOGIN_ATTEMPTS_PREFIX + email;
        redisTemplate.delete(attemptsKey);
    }

    public int getAttemptCount(String email) {
        String attemptsKey = RedisKeys.LOGIN_ATTEMPTS_PREFIX + email;
        Object count = redisTemplate.opsForValue().get(attemptsKey);

        if (count == null) {
            return 0;
        }

        if (count instanceof Integer) {
            return (Integer) count;
        }

        if (count instanceof Long) {
            return ((Long) count).intValue();
        }

        return 0;
    }

    private void lockAccount(String email) {
        String lockoutKey = RedisKeys.LOGIN_LOCKOUT_PREFIX + email;
        LocalDateTime lockoutTimestamp = LocalDateTime.now();
        redisTemplate.opsForValue().set(lockoutKey, lockoutTimestamp, RateLimitConstants.LOCKOUT_DURATION_MINUTES, TimeUnit.MINUTES);
    }
}
