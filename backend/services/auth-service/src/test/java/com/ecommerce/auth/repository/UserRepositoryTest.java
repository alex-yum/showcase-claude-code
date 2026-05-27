package com.ecommerce.auth.repository;

import com.ecommerce.auth.model.entity.User;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.test.context.ActiveProfiles;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@ActiveProfiles("test")
class UserRepositoryTest {

    @Autowired
    private UserRepository userRepository;

    @Test
    void shouldSaveAndFindUserByEmail() {
        // Given
        User user = new User();
        user.setEmail("test@example.com");
        user.setPasswordHash("hashed-password");
        user.setAccountStatus("ACTIVE");

        // When
        User savedUser = userRepository.save(user);
        Optional<User> found = userRepository.findByEmail("test@example.com");

        // Then
        assertThat(savedUser.getId()).isNotNull();
        assertThat(found).isPresent();
        assertThat(found.get().getEmail()).isEqualTo("test@example.com");
    }

    @Test
    void shouldReturnEmptyWhenEmailNotFound() {
        // When
        Optional<User> found = userRepository.findByEmail("nonexistent@example.com");

        // Then
        assertThat(found).isEmpty();
    }

    @Test
    void shouldCheckEmailExists() {
        // Given
        User user = new User();
        user.setEmail("exists@example.com");
        user.setPasswordHash("hashed-password");
        user.setAccountStatus("ACTIVE");
        userRepository.save(user);

        // When
        boolean exists = userRepository.existsByEmail("exists@example.com");
        boolean notExists = userRepository.existsByEmail("notexists@example.com");

        // Then
        assertThat(exists).isTrue();
        assertThat(notExists).isFalse();
    }
}
