package com.ecommerce.auth.service;

import com.ecommerce.auth.exception.AccountLockedException;
import com.ecommerce.auth.exception.InvalidCredentialsException;
import com.ecommerce.auth.exception.InvalidTokenException;
import com.ecommerce.auth.exception.UserAlreadyExistsException;
import com.ecommerce.auth.model.entity.User;
import com.ecommerce.auth.repository.UserRepository;
import io.jsonwebtoken.JwtException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.Map;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final SessionService sessionService;
    private final RateLimitService rateLimitService;

    public AuthService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService,
            SessionService sessionService,
            RateLimitService rateLimitService
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.sessionService = sessionService;
        this.rateLimitService = rateLimitService;
    }

    /**
     * Register a new user with email and password.
     *
     * @param email    User's email address
     * @param password User's plain text password
     * @return Created User entity
     * @throws UserAlreadyExistsException if email already exists
     */
    @Transactional
    public User register(String email, String password) {
        // Check if user already exists
        if (userRepository.existsByEmail(email)) {
            throw new UserAlreadyExistsException(email);
        }

        // Hash password
        String hashedPassword = passwordEncoder.encode(password);

        // Create new user
        User user = new User();
        user.setEmail(email);
        user.setPasswordHash(hashedPassword);
        user.setAccountStatus("ACTIVE");

        // Save and return
        return userRepository.save(user);
    }

    /**
     * Authenticate user and create session.
     *
     * @param email      User's email address
     * @param password   User's plain text password
     * @param rememberMe Whether to create extended session
     * @param deviceInfo Device information (User-Agent)
     * @param ipAddress  Client IP address
     * @return JWT token
     * @throws AccountLockedException      if account is locked due to failed attempts
     * @throws InvalidCredentialsException if credentials are invalid
     */
    @Transactional
    public String login(String email, String password, boolean rememberMe, String deviceInfo, String ipAddress) {
        // Check if account is locked
        if (rateLimitService.isLocked(email)) {
            throw new AccountLockedException(email, 15 * 60 * 1000); // 15 minutes in milliseconds
        }

        // Find user by email
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> {
                    rateLimitService.trackFailedAttempt(email);
                    return new InvalidCredentialsException(email);
                });

        // Validate password
        if (!passwordEncoder.matches(password, user.getPasswordHash())) {
            rateLimitService.trackFailedAttempt(email);
            throw new InvalidCredentialsException(email);
        }

        // Clear failed attempts on successful login
        rateLimitService.clearAttempts(email);

        // Create session
        String sessionId = sessionService.createSession(
                user.getId(),
                email,
                deviceInfo,
                ipAddress,
                rememberMe
        );

        // Generate JWT token
        return jwtService.generateToken(user.getId(), email, sessionId, rememberMe);
    }

    /**
     * Logout user by invalidating session.
     *
     * @param token JWT token
     */
    @Transactional
    public void logout(String token) {
        // Extract session ID from token
        String sessionId = jwtService.extractSessionId(token);

        // Delete session
        sessionService.deleteSession(sessionId);
    }

    /**
     * Validate JWT token and return user information.
     *
     * @param token JWT token
     * @return Map containing userId, email, and expiration
     * @throws InvalidTokenException if token is invalid or session doesn't exist
     */
    @Transactional
    public Map<String, Object> validateToken(String token) {
        try {
            // Validate JWT token
            if (!jwtService.validateToken(token)) {
                throw new InvalidTokenException("Invalid or expired token");
            }

            // Extract session ID and check if session exists
            String sessionId = jwtService.extractSessionId(token);
            if (!sessionService.sessionExists(sessionId)) {
                throw new InvalidTokenException("Session not found or expired");
            }

            // Update session activity
            sessionService.updateLastActivity(sessionId);

            // Extract user information from token
            Long userId = jwtService.extractUserId(token);
            String email = jwtService.extractEmail(token);
            long expiration = jwtService.extractExpiration(token);

            // Return user data
            Map<String, Object> result = new HashMap<>();
            result.put("userId", userId);
            result.put("email", email);
            result.put("expiration", expiration);

            return result;
        } catch (JwtException e) {
            throw new InvalidTokenException("Invalid token format", e);
        }
    }
}
