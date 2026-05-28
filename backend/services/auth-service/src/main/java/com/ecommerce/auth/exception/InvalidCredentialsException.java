package com.ecommerce.auth.exception;

/**
 * Exception thrown when login credentials (email or password) are invalid.
 * HTTP Status: 401 Unauthorized
 */
public class InvalidCredentialsException extends RuntimeException {
    private final String email;

    public InvalidCredentialsException(String email) {
        super("Invalid email or password provided.");
        this.email = email;
    }

    public InvalidCredentialsException(String email, String message) {
        super(message);
        this.email = email;
    }

    public String getEmail() {
        return email;
    }
}
