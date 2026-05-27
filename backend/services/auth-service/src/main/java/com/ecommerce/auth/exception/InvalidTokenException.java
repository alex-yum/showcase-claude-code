package com.ecommerce.auth.exception;

/**
 * Exception thrown when a JWT token is invalid or expired.
 * HTTP Status: 401 Unauthorized
 */
public class InvalidTokenException extends RuntimeException {
    public InvalidTokenException(String message) {
        super(message);
    }

    public InvalidTokenException(String message, Throwable cause) {
        super(message, cause);
    }
}
