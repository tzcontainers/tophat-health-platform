package com.tophat.health.web;

import com.tophat.health.common.ApiEnvelope;
import com.tophat.health.common.CustomUserDetails;
import com.tophat.health.service.GoogleAuthService;
import com.tophat.health.service.JwtService;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final GoogleAuthService googleAuthService;
    private final UserDetailsService userDetailsService;

    public AuthController(AuthenticationManager authenticationManager, JwtService jwtService, GoogleAuthService googleAuthService, UserDetailsService userDetailsService) {
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
        this.googleAuthService = googleAuthService;
        this.userDetailsService = userDetailsService;
    }

    @PostMapping("/login")
    public ApiEnvelope<LoginResponse> login(@RequestBody @Valid LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
        );

        return ApiEnvelope.of(createLoginResponse((CustomUserDetails) authentication.getPrincipal()));
    }

    @PostMapping("/google")
    public ApiEnvelope<LoginResponse> google(@RequestBody GoogleLoginRequest request) {
        return ApiEnvelope.of(createLoginResponse(googleAuthService.authenticate(request.getCredential())));
    }

    @PostMapping("/refresh")
    public ApiEnvelope<LoginResponse> refresh(@RequestBody RefreshRequest request) {
        String refreshToken = request.getRefreshToken();
        String username = jwtService.extractUsername(refreshToken);
        CustomUserDetails userDetails = (CustomUserDetails) userDetailsService.loadUserByUsername(username);

        if (jwtService.isRefreshTokenValid(refreshToken, userDetails)) {
            return ApiEnvelope.of(createLoginResponse(userDetails));
        } else {
            throw new IllegalArgumentException("Invalid refresh token");
        }
    }

    private LoginResponse createLoginResponse(CustomUserDetails userDetails) {
        Map<String, Object> extraClaims = new HashMap<>();
        extraClaims.put("role", userDetails.getUser().getRole().name());
        if (userDetails.getCandidateId() != null) {
            extraClaims.put("candidateId", userDetails.getCandidateId().toString());
        }
        if (userDetails.getClientId() != null) {
            extraClaims.put("clientId", userDetails.getClientId().toString());
        }

        String token = jwtService.generateToken(userDetails, extraClaims);
        String refreshToken = jwtService.generateRefreshToken(userDetails);

        return LoginResponse.builder()
                .token(token)
                .refreshToken(refreshToken)
                .username(userDetails.getUsername())
                .role(userDetails.getUser().getRole().name())
                .candidateId(userDetails.getCandidateId() != null ? userDetails.getCandidateId().toString() : null)
                .clientId(userDetails.getClientId() != null ? userDetails.getClientId().toString() : null)
                .build();
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class LoginRequest {
        @NotBlank
        private String username;
        @NotBlank
        private String password;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class GoogleLoginRequest {
        private String credential;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class LoginResponse {
        private String token;
        private String refreshToken;
        private String username;
        private String role;
        private String candidateId;
        private String clientId;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RefreshRequest {
        private String refreshToken;
    }
}
