package com.ecommerce.auth.exception;

/**
 * Exception thrown when an account is locked due to too many failed login attempts.
 * HTTP Status: 423 Locked
 */
public class AccountLockedException extends RuntimeException {
    private final String email;
    private final long lockoutTimeRemaining;

    public AccountLockedException(String email, long lockoutTimeRemaining) {
        super(String.format("Account for email '%s' is locked. Try again in %d seconds.", email, lockoutTimeRemaining / 1000));
        this.email = email;
        this.lockoutTimeRemaining = lockoutTimeRemaining;
    }

    public String getEmail() {
        return email;
    }

    public long getLockoutTimeRemaining() {
        return lockoutTimeRemaining;
    }
}
