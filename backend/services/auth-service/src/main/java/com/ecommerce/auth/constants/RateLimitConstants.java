package com.ecommerce.auth.constants;

import java.util.concurrent.TimeUnit;

/**
 * Rate limiting constants.
 */
public final class RateLimitConstants {

    private RateLimitConstants() {
        // Utility class - prevent instantiation
    }

    public static final int MAX_ATTEMPTS = 5;
    public static final long LOCKOUT_DURATION_MINUTES = 15;

    // Derived values
    public static final long LOCKOUT_DURATION_MILLIS = TimeUnit.MINUTES.toMillis(LOCKOUT_DURATION_MINUTES);
}
