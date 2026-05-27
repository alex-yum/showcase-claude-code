package com.ecommerce.auth.controller;

import com.ecommerce.auth.model.dto.*;
import com.ecommerce.auth.model.entity.User;
import com.ecommerce.auth.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    /**
     * Register a new user.
     *
     * @param request RegisterRequest containing email and password
     * @return RegisterResponse with user details
     */
    @PostMapping("/register")
    public ResponseEntity<RegisterResponse> register(@Valid @RequestBody RegisterRequest request) {
        User user = authService.register(request.getEmail(), request.getPassword());

        RegisterResponse response = new RegisterResponse(
                user.getId(),
                user.getEmail(),
                "User registered successfully"
        );

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Authenticate user and create session.
     *
     * @param request LoginRequest containing email and password
     * @param httpServletRequest HTTP servlet request to extract device info and IP
     * @return LoginResponse with JWT token
     */
    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(
            @Valid @RequestBody LoginRequest request,
            HttpServletRequest httpServletRequest
    ) {
        String deviceInfo = httpServletRequest.getHeader("User-Agent");
        String ipAddress = getClientIp(httpServletRequest);

        Map<String, Object> loginResult = authService.login(
                request.getEmail(),
                request.getPassword(),
                request.isRememberMe(),
                deviceInfo,
                ipAddress
        );

        LoginResponse response = new LoginResponse();
        response.setAccessToken((String) loginResult.get("token"));
        response.setTokenType("Bearer");
        response.setExpiresIn(((Number) loginResult.get("expiresIn")).longValue());
        response.setEmail(request.getEmail());

        return ResponseEntity.ok(response);
    }

    /**
     * Logout user by invalidating session.
     *
     * @param httpServletRequest HTTP servlet request to extract token from Authorization header
     * @return LogoutResponse with success message
     */
    @PostMapping("/logout")
    public ResponseEntity<LogoutResponse> logout(HttpServletRequest httpServletRequest) {
        String token = extractToken(httpServletRequest);
        authService.logout(token);

        LogoutResponse response = new LogoutResponse("Logout successful");
        return ResponseEntity.ok(response);
    }

    /**
     * Validate JWT token.
     *
     * @param httpServletRequest HTTP servlet request to extract token from Authorization header
     * @return ValidateTokenResponse with validation result
     */
    @GetMapping("/validate")
    public ResponseEntity<ValidateTokenResponse> validateToken(HttpServletRequest httpServletRequest) {
        String token = extractToken(httpServletRequest);
        Map<String, Object> validationResult = authService.validateToken(token);

        ValidateTokenResponse response = new ValidateTokenResponse(
                true,
                ((Number) validationResult.get("userId")).longValue(),
                (String) validationResult.get("email")
        );

        return ResponseEntity.ok(response);
    }

    /**
     * Extract JWT token from Authorization header.
     * Removes "Bearer " prefix if present.
     *
     * @param request HTTP servlet request
     * @return JWT token without "Bearer " prefix
     */
    private String extractToken(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            return authHeader.substring(7);
        }
        return authHeader;
    }

    /**
     * Extract client IP address from request.
     * Checks X-Forwarded-For header first (for proxied requests),
     * then falls back to remote address.
     *
     * @param request HTTP servlet request
     * @return Client IP address
     */
    private String getClientIp(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            // X-Forwarded-For can contain multiple IPs, take the first one
            return xForwardedFor.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
