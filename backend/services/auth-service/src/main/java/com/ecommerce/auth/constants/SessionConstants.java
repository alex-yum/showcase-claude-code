package com.ecommerce.auth.constants;

/**
 * Session-related constants.
 */
public final class SessionConstants {

    private SessionConstants() {
        // Utility class - prevent instantiation
    }

    public static final long DEFAULT_TTL_HOURS = 24;
    public static final long REMEMBER_ME_TTL_DAYS = 30;

    // Derived values for test assertions
    public static final long DEFAULT_TTL_SECONDS = DEFAULT_TTL_HOURS * 60 * 60;
    public static final long REMEMBER_ME_TTL_SECONDS = REMEMBER_ME_TTL_DAYS * 24 * 60 * 60;
}
