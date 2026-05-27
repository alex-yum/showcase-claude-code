package com.ecommerce.auth.service;

import com.ecommerce.auth.constants.RedisKeys;
import com.ecommerce.auth.constants.SessionConstants;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

@Service
public class SessionService {

    private final RedisTemplate<String, Object> redisTemplate;

    public SessionService(RedisTemplate<String, Object> redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    public String createSession(Long userId, String email, String deviceInfo, String ipAddress, boolean rememberMe) {
        String sessionId = UUID.randomUUID().toString();
        String key = RedisKeys.SESSION_PREFIX + sessionId;

        Map<String, Object> sessionData = new HashMap<>();
        sessionData.put("userId", userId);
        sessionData.put("email", email);
        sessionData.put("deviceInfo", deviceInfo);
        sessionData.put("ipAddress", ipAddress);
        sessionData.put("rememberMe", rememberMe);
        sessionData.put("createdAt", LocalDateTime.now());
        sessionData.put("lastActivityAt", LocalDateTime.now());

        if (rememberMe) {
            redisTemplate.opsForValue().set(key, sessionData, SessionConstants.REMEMBER_ME_TTL_DAYS, TimeUnit.DAYS);
        } else {
            redisTemplate.opsForValue().set(key, sessionData, SessionConstants.DEFAULT_TTL_HOURS, TimeUnit.HOURS);
        }

        return sessionId;
    }

    @SuppressWarnings("unchecked")
    public Map<String, Object> getSession(String sessionId) {
        String key = RedisKeys.SESSION_PREFIX + sessionId;
        Object sessionData = redisTemplate.opsForValue().get(key);
        return (Map<String, Object>) sessionData;
    }

    public boolean sessionExists(String sessionId) {
        String key = RedisKeys.SESSION_PREFIX + sessionId;
        Boolean exists = redisTemplate.hasKey(key);
        return exists != null && exists;
    }

    public void deleteSession(String sessionId) {
        String key = RedisKeys.SESSION_PREFIX + sessionId;
        redisTemplate.delete(key);
    }

    public void updateLastActivity(String sessionId) {
        String key = RedisKeys.SESSION_PREFIX + sessionId;
        Map<String, Object> sessionData = getSession(sessionId);

        if (sessionData != null) {
            sessionData.put("lastActivityAt", LocalDateTime.now());
            redisTemplate.opsForValue().set(key, sessionData);
        }
    }
}
