package com.ecommerce.auth.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConfigurationProperties(prefix = "jwt")
public class JwtConfig {

    private String secret;
    private Long expirationMs;
    private Long rememberMeExpirationMs;

    public String getSecret() {
        return secret;
    }

    public void setSecret(String secret) {
        this.secret = secret;
    }

    public Long getExpirationMs() {
        return expirationMs;
    }

    public void setExpirationMs(Long expirationMs) {
        this.expirationMs = expirationMs;
    }

    public Long getRememberMeExpirationMs() {
        return rememberMeExpirationMs;
    }

    public void setRememberMeExpirationMs(Long rememberMeExpirationMs) {
        this.rememberMeExpirationMs = rememberMeExpirationMs;
    }
}
