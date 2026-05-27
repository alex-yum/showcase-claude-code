package com.ecommerce.auth.model.dto;

public class ValidateTokenResponse {

    private boolean valid;
    private Long userId;
    private String email;
    private String error;

    public ValidateTokenResponse() {}

    public ValidateTokenResponse(boolean valid, Long userId, String email) {
        this.valid = valid;
        this.userId = userId;
        this.email = email;
    }

    public ValidateTokenResponse(boolean valid, String error) {
        this.valid = valid;
        this.error = error;
    }

    public boolean isValid() {
        return valid;
    }

    public void setValid(boolean valid) {
        this.valid = valid;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getError() {
        return error;
    }

    public void setError(String error) {
        this.error = error;
    }
}
