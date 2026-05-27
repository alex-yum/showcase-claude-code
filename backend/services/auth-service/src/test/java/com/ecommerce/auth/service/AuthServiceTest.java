package com.ecommerce.auth.service;

import com.ecommerce.auth.constants.SessionConstants;
import com.ecommerce.auth.exception.AccountLockedException;
import com.ecommerce.auth.exception.InvalidCredentialsException;
import com.ecommerce.auth.exception.InvalidTokenException;
import com.ecommerce.auth.exception.UserAlreadyExistsException;
import com.ecommerce.auth.model.entity.User;
import com.ecommerce.auth.model.enums.AccountStatus;
import com.ecommerce.auth.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Map;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("AuthService Tests")
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtService jwtService;

    @Mock
    private SessionService sessionService;

    @Mock
    private RateLimitService rateLimitService;

    @Mock
    private com.ecommerce.auth.config.JwtConfig jwtConfig;

    @InjectMocks
    private AuthService authService;

    private User testUser;

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setId(1L);
        testUser.setEmail("test@example.com");
        testUser.setPasswordHash("$2a$12$hashedPassword");
        testUser.setAccountStatus(AccountStatus.ACTIVE);
    }

    @Test
    @DisplayName("register() should create user when email does not exist")
    void register_shouldCreateUser_whenEmailDoesNotExist() {
        // Arrange
        String email = "newuser@example.com";
        String password = "Password123!";
        String hashedPassword = "$2a$12$newHashedPassword";

        when(userRepository.existsByEmail(email)).thenReturn(false);
        when(passwordEncoder.encode(password)).thenReturn(hashedPassword);
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
            User user = invocation.getArgument(0);
            user.setId(2L);
            return user;
        });

        // Act
        User result = authService.register(email, password);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(2L);
        assertThat(result.getEmail()).isEqualTo(email);
        assertThat(result.getPasswordHash()).isEqualTo(hashedPassword);
        assertThat(result.getAccountStatus()).isEqualTo(AccountStatus.ACTIVE);

        verify(userRepository).existsByEmail(email);
        verify(passwordEncoder).encode(password);
        verify(userRepository).save(any(User.class));
    }

    @Test
    @DisplayName("register() should throw UserAlreadyExistsException when email exists")
    void register_shouldThrowException_whenEmailExists() {
        // Arrange
        String email = "existing@example.com";
        String password = "Password123!";

        when(userRepository.existsByEmail(email)).thenReturn(true);

        // Act & Assert
        assertThatThrownBy(() -> authService.register(email, password))
                .isInstanceOf(UserAlreadyExistsException.class)
                .hasMessageContaining(email);

        verify(userRepository).existsByEmail(email);
        verify(passwordEncoder, never()).encode(anyString());
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    @DisplayName("login() should return JWT token and expiresIn when credentials are valid")
    void login_shouldReturnToken_whenCredentialsAreValid() {
        // Arrange
        String email = "test@example.com";
        String password = "Password123!";
        String deviceInfo = "Chrome/Windows";
        String ipAddress = "192.168.1.1";
        boolean rememberMe = false;
        String sessionId = "session-123";
        String expectedToken = "jwt.token.here";
        long expirationMs = 86400000L; // 24 hours

        when(rateLimitService.isLocked(email)).thenReturn(false);
        when(userRepository.findByEmail(email)).thenReturn(Optional.of(testUser));
        when(passwordEncoder.matches(password, testUser.getPasswordHash())).thenReturn(true);
        when(sessionService.createSession(testUser.getId(), email, deviceInfo, ipAddress, rememberMe))
                .thenReturn(sessionId);
        when(jwtService.generateToken(testUser.getId(), email, sessionId, rememberMe))
                .thenReturn(expectedToken);
        when(jwtConfig.getExpirationMs()).thenReturn(expirationMs);

        // Act
        Map<String, Object> result = authService.login(email, password, rememberMe, deviceInfo, ipAddress);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.get("token")).isEqualTo(expectedToken);
        assertThat(result.get("expiresIn")).isEqualTo(SessionConstants.DEFAULT_TTL_SECONDS);

        verify(rateLimitService).isLocked(email);
        verify(userRepository).findByEmail(email);
        verify(passwordEncoder).matches(password, testUser.getPasswordHash());
        verify(sessionService).createSession(testUser.getId(), email, deviceInfo, ipAddress, rememberMe);
        verify(jwtService).generateToken(testUser.getId(), email, sessionId, rememberMe);
        verify(rateLimitService).clearAttempts(email);
        verify(jwtConfig).getExpirationMs();
    }

    @Test
    @DisplayName("login() should throw AccountLockedException when account is locked")
    void login_shouldThrowException_whenAccountIsLocked() {
        // Arrange
        String email = "locked@example.com";
        String password = "Password123!";
        String deviceInfo = "Chrome/Windows";
        String ipAddress = "192.168.1.1";

        when(rateLimitService.isLocked(email)).thenReturn(true);

        // Act & Assert
        assertThatThrownBy(() -> authService.login(email, password, false, deviceInfo, ipAddress))
                .isInstanceOf(AccountLockedException.class)
                .hasMessageContaining(email);

        verify(rateLimitService).isLocked(email);
        verify(userRepository, never()).findByEmail(anyString());
    }

    @Test
    @DisplayName("login() should throw InvalidCredentialsException and track failed attempt when password is wrong")
    void login_shouldThrowExceptionAndTrackFailedAttempt_whenPasswordIsWrong() {
        // Arrange
        String email = "test@example.com";
        String wrongPassword = "WrongPassword123!";
        String deviceInfo = "Chrome/Windows";
        String ipAddress = "192.168.1.1";

        when(rateLimitService.isLocked(email)).thenReturn(false);
        when(userRepository.findByEmail(email)).thenReturn(Optional.of(testUser));
        when(passwordEncoder.matches(wrongPassword, testUser.getPasswordHash())).thenReturn(false);

        // Act & Assert
        assertThatThrownBy(() -> authService.login(email, wrongPassword, false, deviceInfo, ipAddress))
                .isInstanceOf(InvalidCredentialsException.class)
                .hasMessageContaining("Invalid email or password");

        verify(rateLimitService).isLocked(email);
        verify(userRepository).findByEmail(email);
        verify(passwordEncoder).matches(wrongPassword, testUser.getPasswordHash());
        verify(rateLimitService).trackFailedAttempt(email);
        verify(sessionService, never()).createSession(anyLong(), anyString(), anyString(), anyString(), anyBoolean());
    }

    @Test
    @DisplayName("login() should throw InvalidCredentialsException when user does not exist")
    void login_shouldThrowException_whenUserDoesNotExist() {
        // Arrange
        String email = "nonexistent@example.com";
        String password = "Password123!";
        String deviceInfo = "Chrome/Windows";
        String ipAddress = "192.168.1.1";

        when(rateLimitService.isLocked(email)).thenReturn(false);
        when(userRepository.findByEmail(email)).thenReturn(Optional.empty());

        // Act & Assert
        assertThatThrownBy(() -> authService.login(email, password, false, deviceInfo, ipAddress))
                .isInstanceOf(InvalidCredentialsException.class)
                .hasMessageContaining("Invalid email or password");

        verify(rateLimitService).isLocked(email);
        verify(userRepository).findByEmail(email);
        verify(rateLimitService).trackFailedAttempt(email);
        verify(passwordEncoder, never()).matches(anyString(), anyString());
    }

    @Test
    @DisplayName("logout() should delete session successfully")
    void logout_shouldDeleteSession_successfully() {
        // Arrange
        String token = "jwt.token.here";
        String sessionId = "session-123";

        when(jwtService.extractSessionId(token)).thenReturn(sessionId);

        // Act
        authService.logout(token);

        // Assert
        verify(jwtService).extractSessionId(token);
        verify(sessionService).deleteSession(sessionId);
    }

    @Test
    @DisplayName("validateToken() should return user data when token and session are valid")
    void validateToken_shouldReturnUserData_whenTokenAndSessionAreValid() {
        // Arrange
        String token = "jwt.token.here";
        String sessionId = "session-123";
        Long userId = 1L;
        String email = "test@example.com";
        long expiration = System.currentTimeMillis() + 3600000;

        Map<String, Object> sessionData = Map.of(
                "userId", userId,
                "email", email,
                "deviceInfo", "Chrome/Windows",
                "ipAddress", "192.168.1.1"
        );

        when(jwtService.validateToken(token)).thenReturn(true);
        when(jwtService.extractSessionId(token)).thenReturn(sessionId);
        when(sessionService.sessionExists(sessionId)).thenReturn(true);
        when(jwtService.extractUserId(token)).thenReturn(userId);
        when(jwtService.extractEmail(token)).thenReturn(email);
        when(jwtService.extractExpiration(token)).thenReturn(expiration);

        // Act
        Map<String, Object> result = authService.validateToken(token);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.get("userId")).isEqualTo(userId);
        assertThat(result.get("email")).isEqualTo(email);
        assertThat(result.get("expiration")).isEqualTo(expiration);

        verify(jwtService).validateToken(token);
        verify(jwtService).extractSessionId(token);
        verify(sessionService).sessionExists(sessionId);
        verify(sessionService).updateLastActivity(sessionId);
        verify(jwtService).extractUserId(token);
        verify(jwtService).extractEmail(token);
        verify(jwtService).extractExpiration(token);
    }

    @Test
    @DisplayName("validateToken() should throw InvalidTokenException when session does not exist")
    void validateToken_shouldThrowException_whenSessionDoesNotExist() {
        // Arrange
        String token = "jwt.token.here";
        String sessionId = "session-123";

        when(jwtService.validateToken(token)).thenReturn(true);
        when(jwtService.extractSessionId(token)).thenReturn(sessionId);
        when(sessionService.sessionExists(sessionId)).thenReturn(false);

        // Act & Assert
        assertThatThrownBy(() -> authService.validateToken(token))
                .isInstanceOf(InvalidTokenException.class)
                .hasMessageContaining("Session not found or expired");

        verify(jwtService).validateToken(token);
        verify(jwtService).extractSessionId(token);
        verify(sessionService).sessionExists(sessionId);
        verify(sessionService, never()).updateLastActivity(anyString());
    }
}
