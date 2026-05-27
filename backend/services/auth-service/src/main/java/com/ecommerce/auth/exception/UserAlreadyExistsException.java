package com.ecommerce.auth.exception;

/**
 * Exception thrown when attempting to register with an email that already exists.
 * HTTP Status: 409 Conflict
 */
public class UserAlreadyExistsException extends RuntimeException {
    private final String email;

    public UserAlreadyExistsException(String email) {
        super(String.format("User with email '%s' already exists.", email));
        this.email = email;
    }

    public String getEmail() {
        return email;
    }
}
