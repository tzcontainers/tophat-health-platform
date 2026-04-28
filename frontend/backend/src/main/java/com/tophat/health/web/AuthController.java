package com.tophat.health.web;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.tophat.health.common.ApiEnvelope;
import com.tophat.health.common.CustomUserDetails;
import com.tophat.health.domain.User;
import com.tophat.health.repository.UserRepository;
import com.tophat.health.service.JwtService;
import lombok.Builder;
import lombok.Data;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;
import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import org.springframework.security.crypto.password.PasswordEncoder;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private static final String GOOGLE_TOKEN_INFO_URL = "https://oauth2.googleapis.com/tokeninfo?id_token=";

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final ObjectMapper objectMapper;
    private final HttpClient httpClient;

    @Value("${app.security.google.client-id:}")
    private String googleClientId;

    public AuthController(AuthenticationManager authenticationManager, JwtService jwtService,
            UserRepository userRepository, PasswordEncoder passwordEncoder, ObjectMapper objectMapper) {
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.objectMapper = objectMapper;
        this.httpClient = HttpClient.newHttpClient();
    }

    @PostMapping("/login")
    public ApiEnvelope<LoginResponse> login(@RequestBody LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword()));

        return buildLoginResponse((CustomUserDetails) authentication.getPrincipal());
    }

    @PostMapping("/google")
    public ApiEnvelope<LoginResponse> google(@RequestBody GoogleLoginRequest request) {
        GoogleTokenInfo tokenInfo = verifyGoogleIdToken(request.getCredential());
        if (tokenInfo == null || tokenInfo.getEmail() == null || !tokenInfo.isEmailVerified()) {
            throw new IllegalArgumentException("Google sign-in failed to validate the account.");
        }
        if (googleClientId != null && !googleClientId.isBlank() && !googleClientId.equals(tokenInfo.getAud())) {
            throw new IllegalArgumentException("Google sign-in is not configured for this application.");
        }

        User user = userRepository.findByUsername(tokenInfo.getEmail())
                .orElseGet(() -> createGoogleUser(tokenInfo.getEmail()));

        return buildLoginResponse(new CustomUserDetails(user));
    }

    private User createGoogleUser(String email) {
        User user = new User();
        user.setId(UUID.randomUUID());
        user.setUsername(email);
        user.setPassword(passwordEncoder.encode(UUID.randomUUID().toString()));
        user.setRole(com.tophat.health.domain.enums.Role.CANDIDATE);
        return userRepository.save(user);
    }

    private LoginResponse buildLoginResponse(CustomUserDetails userDetails) {
        Map<String, Object> extraClaims = new HashMap<>();
        extraClaims.put("role", userDetails.getUser().getRole().name());
        if (userDetails.getCandidateId() != null) {
            extraClaims.put("candidateId", userDetails.getCandidateId().toString());
        }
        if (userDetails.getClientId() != null) {
            extraClaims.put("clientId", userDetails.getClientId().toString());
        }

        String token = jwtService.generateToken(userDetails, extraClaims);

        return LoginResponse.builder()
                .token(token)
                .username(userDetails.getUsername())
                .role(userDetails.getUser().getRole().name())
                .candidateId(userDetails.getCandidateId() != null ? userDetails.getCandidateId().toString() : null)
                .clientId(userDetails.getClientId() != null ? userDetails.getClientId().toString() : null)
                .build();
    }

    private GoogleTokenInfo verifyGoogleIdToken(String credential) {
        try {
            String url = GOOGLE_TOKEN_INFO_URL + URLEncoder.encode(credential, StandardCharsets.UTF_8);
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .GET()
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() != 200) {
                return null;
            }

            JsonNode json = objectMapper.readTree(response.body());
            return new GoogleTokenInfo(
                    json.path("aud").asText(null),
                    json.path("email").asText(null),
                    json.path("email_verified").asBoolean(false));
        } catch (IOException | InterruptedException ex) {
            throw new IllegalArgumentException("Unable to verify Google credential.", ex);
        }
    }

    @Data
    public static class LoginRequest {
        private String username;
        private String password;
    }

    @Data
    public static class GoogleLoginRequest {
        private String credential;
    }

    @Data
    @Builder
    public static class LoginResponse {
        private String token;
        private String username;
        private String role;
        private String candidateId;
        private String clientId;
    }

    @Data
    private static class GoogleTokenInfo {
        private final String aud;
        private final String email;
        private final boolean emailVerified;
    }
}
