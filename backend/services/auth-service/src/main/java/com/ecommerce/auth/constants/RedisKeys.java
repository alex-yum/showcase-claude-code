package com.ecommerce.auth.constants;

/**
 * Redis key prefixes used across the auth service.
 * Centralized to ensure consistency between services and tests.
 */
public final class RedisKeys {

    private RedisKeys() {
        // Utility class - prevent instantiation
    }

    public static final String SESSION_PREFIX = "session:";
    public static final String LOGIN_ATTEMPTS_PREFIX = "login:attempts:";
    public static final String LOGIN_LOCKOUT_PREFIX = "login:lockout:";
}
