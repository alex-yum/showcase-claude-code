package com.ecommerce.auth.controller;

import com.ecommerce.auth.constants.SessionConstants;

import com.ecommerce.auth.exception.AccountLockedException;
import com.ecommerce.auth.exception.InvalidCredentialsException;
import com.ecommerce.auth.exception.InvalidTokenException;
import com.ecommerce.auth.exception.UserAlreadyExistsException;
import com.ecommerce.auth.model.dto.LoginRequest;
import com.ecommerce.auth.model.dto.RegisterRequest;
import com.ecommerce.auth.model.entity.User;
import com.ecommerce.auth.service.AuthService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.util.HashMap;
import java.util.Map;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(AuthController.class)
@AutoConfigureMockMvc(addFilters = false)
@DisplayName("AuthController Tests")
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private AuthService authService;

    @Test
    @DisplayName("POST /api/v1/auth/register should register user successfully")
    void register_shouldReturnCreated_whenValidRequest() throws Exception {
        // Arrange
        RegisterRequest request = new RegisterRequest();
        request.setEmail("test@example.com");
        request.setPassword("Password123!");

        User mockUser = new User();
        mockUser.setId(1L);
        mockUser.setEmail("test@example.com");

        when(authService.register(anyString(), anyString())).thenReturn(mockUser);

        // Act & Assert
        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.userId").value(1L))
                .andExpect(jsonPath("$.email").value("test@example.com"))
                .andExpect(jsonPath("$.message").value("User registered successfully"));

        verify(authService).register("test@example.com", "Password123!");
    }

    @Test
    @DisplayName("POST /api/v1/auth/register should return 400 when email is invalid")
    void register_shouldReturnBadRequest_whenEmailIsInvalid() throws Exception {
        // Arrange
        RegisterRequest request = new RegisterRequest();
        request.setEmail("invalid-email");
        request.setPassword("Password123!");

        // Act & Assert
        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());

        verify(authService, never()).register(anyString(), anyString());
    }

    @Test
    @DisplayName("POST /api/v1/auth/login should authenticate user successfully")
    void login_shouldReturnOk_whenValidCredentials() throws Exception {
        // Arrange
        LoginRequest request = new LoginRequest();
        request.setEmail("test@example.com");
        request.setPassword("Password123!");
        request.setRememberMe(false);

        Map<String, Object> mockLoginResult = new HashMap<>();
        mockLoginResult.put("token", "jwt.token.here");
        mockLoginResult.put("expiresIn", SessionConstants.DEFAULT_TTL_SECONDS);

        when(authService.login(anyString(), anyString(), anyBoolean(), anyString(), anyString()))
                .thenReturn(mockLoginResult);

        // Act & Assert
        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .header("User-Agent", "Chrome/Windows")
                        .header("X-Forwarded-For", "192.168.1.1")
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").value("jwt.token.here"))
                .andExpect(jsonPath("$.tokenType").value("Bearer"))
                .andExpect(jsonPath("$.expiresIn").value(SessionConstants.DEFAULT_TTL_SECONDS))
                .andExpect(jsonPath("$.userId").doesNotExist())
                .andExpect(jsonPath("$.email").value("test@example.com"));

        verify(authService).login(
                eq("test@example.com"),
                eq("Password123!"),
                eq(false),
                eq("Chrome/Windows"),
                eq("192.168.1.1")
        );
    }

    @Test
    @DisplayName("POST /api/v1/auth/login should return 401 when credentials are invalid")
    void login_shouldReturnUnauthorized_whenCredentialsAreInvalid() throws Exception {
        // Arrange
        LoginRequest request = new LoginRequest();
        request.setEmail("test@example.com");
        request.setPassword("WrongPassword123!");

        when(authService.login(anyString(), anyString(), anyBoolean(), anyString(), anyString()))
                .thenThrow(new InvalidCredentialsException("test@example.com"));

        // Act & Assert
        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .header("User-Agent", "Chrome/Windows")
                        .header("X-Forwarded-For", "192.168.1.1")
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized());

        verify(authService).login(anyString(), anyString(), anyBoolean(), anyString(), anyString());
    }

    @Test
    @DisplayName("POST /api/v1/auth/logout should logout user successfully")
    void logout_shouldReturnOk_whenValidToken() throws Exception {
        // Arrange
        String token = "Bearer jwt.token.here";
        doNothing().when(authService).logout(anyString());

        // Act & Assert
        mockMvc.perform(post("/api/v1/auth/logout")
                        .header("Authorization", token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Logout successful"));

        verify(authService).logout("jwt.token.here");
    }

    @Test
    @DisplayName("GET /api/v1/auth/validate should validate token successfully")
    void validateToken_shouldReturnOk_whenTokenIsValid() throws Exception {
        // Arrange
        String token = "Bearer jwt.token.here";
        Map<String, Object> validationResult = new HashMap<>();
        validationResult.put("userId", 1L);
        validationResult.put("email", "test@example.com");
        validationResult.put("expiration", System.currentTimeMillis() + 3600000);

        when(authService.validateToken(anyString())).thenReturn(validationResult);

        // Act & Assert
        mockMvc.perform(get("/api/v1/auth/validate")
                        .header("Authorization", token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.valid").value(true))
                .andExpect(jsonPath("$.userId").value(1L))
                .andExpect(jsonPath("$.email").value("test@example.com"))
                .andExpect(jsonPath("$.error").doesNotExist());

        verify(authService).validateToken("jwt.token.here");
    }
}
