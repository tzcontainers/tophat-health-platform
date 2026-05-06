package com.tophat.health.web;

import com.tophat.health.common.ApiEnvelope;
import com.tophat.health.common.CustomUserDetails;
import com.tophat.health.service.GoogleAuthService;
import com.tophat.health.service.JwtService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.web.bind.annotation.GetMapping;
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
    private static final long ACCESS_COOKIE_MAX_AGE_SECONDS = 60L * 60L * 24L;
    private static final long REFRESH_COOKIE_MAX_AGE_SECONDS = 60L * 60L * 24L * 7L;

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
    public ApiEnvelope<LoginResponse> login(@RequestBody @Valid LoginRequest request,
            HttpServletRequest httpRequest,
            HttpServletResponse httpResponse) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
        );

        return writeSessionResponse((CustomUserDetails) authentication.getPrincipal(), httpRequest, httpResponse);
    }

    @PostMapping("/google")
    public ApiEnvelope<LoginResponse> google(@RequestBody GoogleLoginRequest request,
            HttpServletRequest httpRequest,
            HttpServletResponse httpResponse) {
        return writeSessionResponse(googleAuthService.authenticate(request.getCredential()), httpRequest, httpResponse);
    }

    @PostMapping("/refresh")
    public ApiEnvelope<LoginResponse> refresh(@RequestBody(required = false) RefreshRequest request,
            HttpServletRequest httpRequest,
            HttpServletResponse httpResponse) {
        String refreshToken = extractRefreshToken(request, httpRequest);
        String username = jwtService.extractUsername(refreshToken);
        CustomUserDetails userDetails = (CustomUserDetails) userDetailsService.loadUserByUsername(username);

        if (jwtService.isRefreshTokenValid(refreshToken, userDetails)) {
            return writeSessionResponse(userDetails, httpRequest, httpResponse);
        } else {
            throw new IllegalArgumentException("Invalid refresh token");
        }
    }

    @GetMapping("/session")
    public ApiEnvelope<LoginResponse> session(@AuthenticationPrincipal CustomUserDetails userDetails) {
        if (userDetails == null) {
            return ApiEnvelope.of(null);
        }
        return ApiEnvelope.of(createLoginResponse(userDetails).withoutTokens());
    }

    @PostMapping("/logout")
    public ApiEnvelope<Map<String, Object>> logout(HttpServletRequest httpRequest, HttpServletResponse httpResponse) {
        clearSessionCookies(httpRequest, httpResponse);
        return ApiEnvelope.of(Map.of("loggedOut", true));
    }

    private ApiEnvelope<LoginResponse> writeSessionResponse(CustomUserDetails userDetails,
            HttpServletRequest httpRequest,
            HttpServletResponse httpResponse) {
        LoginResponse response = createLoginResponse(userDetails);
        writeSessionCookies(httpRequest, httpResponse, response);
        return ApiEnvelope.of(response.withoutTokens());
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

    private String extractRefreshToken(RefreshRequest request, HttpServletRequest httpRequest) {
        if (request != null && request.getRefreshToken() != null && !request.getRefreshToken().isBlank()) {
            return request.getRefreshToken();
        }
        if (httpRequest.getCookies() != null) {
            for (jakarta.servlet.http.Cookie cookie : httpRequest.getCookies()) {
                if (JwtService.REFRESH_COOKIE_NAME.equals(cookie.getName())) {
                    return cookie.getValue();
                }
            }
        }
        throw new IllegalArgumentException("Missing refresh token");
    }

    private void writeSessionCookies(HttpServletRequest request, HttpServletResponse response, LoginResponse session) {
        boolean secure = isSecureRequest(request);
        response.addHeader(HttpHeaders.SET_COOKIE, buildCookie(JwtService.ACCESS_COOKIE_NAME, session.getToken(),
                ACCESS_COOKIE_MAX_AGE_SECONDS, secure).toString());
        response.addHeader(HttpHeaders.SET_COOKIE, buildCookie(JwtService.REFRESH_COOKIE_NAME, session.getRefreshToken(),
                REFRESH_COOKIE_MAX_AGE_SECONDS, secure).toString());
        response.addHeader(HttpHeaders.SET_COOKIE, buildCookie(JwtService.ROLE_COOKIE_NAME, session.getRole(),
                REFRESH_COOKIE_MAX_AGE_SECONDS, secure).toString());
    }

    private void clearSessionCookies(HttpServletRequest request, HttpServletResponse response) {
        boolean secure = isSecureRequest(request);
        response.addHeader(HttpHeaders.SET_COOKIE, buildCookie(JwtService.ACCESS_COOKIE_NAME, "", 0, secure).toString());
        response.addHeader(HttpHeaders.SET_COOKIE, buildCookie(JwtService.REFRESH_COOKIE_NAME, "", 0, secure).toString());
        response.addHeader(HttpHeaders.SET_COOKIE, buildCookie(JwtService.ROLE_COOKIE_NAME, "", 0, secure).toString());
    }

    private ResponseCookie buildCookie(String name, String value, long maxAgeSeconds, boolean secure) {
        return ResponseCookie.from(name, value == null ? "" : value)
                .httpOnly(true)
                .secure(secure)
                .path("/")
                .sameSite("Lax")
                .maxAge(maxAgeSeconds)
                .build();
    }

    private boolean isSecureRequest(HttpServletRequest request) {
        return request.isSecure() || "https".equalsIgnoreCase(request.getHeader("X-Forwarded-Proto"));
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

        public LoginResponse withoutTokens() {
            return LoginResponse.builder()
                    .username(username)
                    .role(role)
                    .candidateId(candidateId)
                    .clientId(clientId)
                    .build();
        }
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RefreshRequest {
        private String refreshToken;
    }
}
