package com.tophat.health.web;

import com.tophat.health.common.ApiEnvelope;
import com.tophat.health.domain.User;
import com.tophat.health.domain.enums.Role;
import com.tophat.health.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/admin")
public class AdminUserController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AdminUserController(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @GetMapping("/users")
    public ApiEnvelope<List<UserResponse>> listUsers() {
        List<UserResponse> users = new ArrayList<>();
        userRepository.findAll().forEach(user -> users.add(UserResponse.from(user)));
        return ApiEnvelope.of(users);
    }

    @PostMapping("/users")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiEnvelope<UserResponse> createUser(@RequestBody CreateUserRequest request) {
        if (request.getUsername() == null || request.getUsername().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Username is required");
        }
        if (userRepository.findByUsername(request.getUsername()).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "A user with that username already exists.");
        }

        User user = new User();
        user.setId(UUID.randomUUID());
        user.setUsername(request.getUsername());
        user.setPassword(passwordEncoder.encode(request.getPassword() == null || request.getPassword().isBlank()
                ? UUID.randomUUID().toString()
                : request.getPassword()));
        user.setRole(resolveRole(request.getRole()));
        userRepository.save(user);

        return ApiEnvelope.of(UserResponse.from(user));
    }

    @PatchMapping("/users/{id}/role")
    public ApiEnvelope<UserResponse> updateRole(@PathVariable UUID id, @RequestBody UpdateRoleRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        user.setRole(resolveRole(request.getRole()));
        userRepository.save(user);
        return ApiEnvelope.of(UserResponse.from(user));
    }

    @PostMapping("/users/{id}/make-admin")
    public ApiEnvelope<UserResponse> makeAdmin(@PathVariable UUID id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        user.setRole(Role.ADMIN);
        userRepository.save(user);
        return ApiEnvelope.of(UserResponse.from(user));
    }

    @DeleteMapping("/users/{id}")
    public ApiEnvelope<Void> deleteUser(@PathVariable UUID id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        userRepository.delete(user);
        return ApiEnvelope.of(null);
    }

    private Role resolveRole(String role) {
        if (role == null) {
            return Role.CANDIDATE;
        }
        try {
            return Role.valueOf(role.toUpperCase());
        } catch (IllegalArgumentException e) {
            return Role.CANDIDATE;
        }
    }

    public static class CreateUserRequest {
        private String username;
        private String password;
        private String role;

        public String getUsername() {
            return username;
        }

        public void setUsername(String username) {
            this.username = username;
        }

        public String getPassword() {
            return password;
        }

        public void setPassword(String password) {
            this.password = password;
        }

        public String getRole() {
            return role;
        }

        public void setRole(String role) {
            this.role = role;
        }
    }

    public static class UpdateRoleRequest {
        private String role;

        public String getRole() {
            return role;
        }

        public void setRole(String role) {
            this.role = role;
        }
    }

    public static class UserResponse {
        private UUID id;
        private String username;
        private String role;

        public static UserResponse from(User user) {
            UserResponse response = new UserResponse();
            response.id = user.getId();
            response.username = user.getUsername();
            response.role = user.getRole() != null ? user.getRole().name() : null;
            return response;
        }

        public UUID getId() {
            return id;
        }

        public String getUsername() {
            return username;
        }

        public String getRole() {
            return role;
        }
    }
}
