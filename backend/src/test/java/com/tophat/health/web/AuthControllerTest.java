package com.tophat.health.web;

import com.tophat.health.common.ApiEnvelope;
import com.tophat.health.common.CustomUserDetails;
import com.tophat.health.domain.Candidate;
import com.tophat.health.domain.User;
import com.tophat.health.domain.enums.Role;
import com.tophat.health.service.GoogleAuthService;
import com.tophat.health.service.JwtService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetailsService;

import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class AuthControllerTest {

    private AuthenticationManager authenticationManager;
    private JwtService jwtService;
    private GoogleAuthService googleAuthService;
    private UserDetailsService userDetailsService;
    private AuthController controller;

    @BeforeEach
    void setUp() {
        authenticationManager = mock(AuthenticationManager.class);
        jwtService = mock(JwtService.class);
        googleAuthService = mock(GoogleAuthService.class);
        userDetailsService = mock(UserDetailsService.class);
        controller = new AuthController(authenticationManager, jwtService, googleAuthService, userDetailsService);
    }

    @Test
    void loginSetsCookiesAndReturnsSanitizedSession() {
        CustomUserDetails userDetails = new CustomUserDetails(candidateUser());
        Authentication authentication = new UsernamePasswordAuthenticationToken(
                userDetails,
                null,
                userDetails.getAuthorities()
        );
        when(authenticationManager.authenticate(any())).thenReturn(authentication);
        when(jwtService.generateToken(any(), any())).thenReturn("access-token");
        when(jwtService.generateRefreshToken(any())).thenReturn("refresh-token");

        MockHttpServletRequest request = new MockHttpServletRequest();
        MockHttpServletResponse response = new MockHttpServletResponse();

        ApiEnvelope<AuthController.LoginResponse> envelope = controller.login(
                new AuthController.LoginRequest("amara.jones@example.com", "password"),
                request,
                response
        );

        assertThat(envelope.data().getToken()).isNull();
        assertThat(envelope.data().getRefreshToken()).isNull();
        assertThat(envelope.data().getRole()).isEqualTo("CANDIDATE");
        assertThat(response.getHeaders("Set-Cookie"))
                .anyMatch(value -> value.contains(JwtService.ACCESS_COOKIE_NAME + "=access-token"))
                .anyMatch(value -> value.contains(JwtService.REFRESH_COOKIE_NAME + "=refresh-token"))
                .anyMatch(value -> value.contains(JwtService.ROLE_COOKIE_NAME + "=CANDIDATE"));
    }

    @Test
    void refreshUsesCookieWhenBodyIsEmpty() {
        CustomUserDetails userDetails = new CustomUserDetails(candidateUser());
        when(jwtService.extractUsername("refresh-cookie")).thenReturn("amara.jones@example.com");
        when(userDetailsService.loadUserByUsername("amara.jones@example.com")).thenReturn(userDetails);
        when(jwtService.isRefreshTokenValid("refresh-cookie", userDetails)).thenReturn(true);
        when(jwtService.generateToken(any(), any())).thenReturn("new-access-token");
        when(jwtService.generateRefreshToken(any())).thenReturn("new-refresh-token");

        MockHttpServletRequest request = new MockHttpServletRequest();
        request.setCookies(new jakarta.servlet.http.Cookie(JwtService.REFRESH_COOKIE_NAME, "refresh-cookie"));
        MockHttpServletResponse response = new MockHttpServletResponse();

        ApiEnvelope<AuthController.LoginResponse> envelope = controller.refresh(null, request, response);

        assertThat(envelope.data().getUsername()).isEqualTo("amara.jones@example.com");
        assertThat(response.getHeaders("Set-Cookie"))
                .anyMatch(value -> value.contains(JwtService.ACCESS_COOKIE_NAME + "=new-access-token"))
                .anyMatch(value -> value.contains(JwtService.REFRESH_COOKIE_NAME + "=new-refresh-token"));
    }

    @Test
    void logoutClearsAllSessionCookies() {
        MockHttpServletRequest request = new MockHttpServletRequest();
        MockHttpServletResponse response = new MockHttpServletResponse();

        ApiEnvelope<java.util.Map<String, Object>> envelope = controller.logout(request, response);

        assertThat(envelope.data()).containsEntry("loggedOut", true);
        assertThat(response.getHeaders("Set-Cookie"))
                .allMatch(value -> value.contains("Max-Age=0"));
    }

    private User candidateUser() {
        Candidate candidate = new Candidate();
        candidate.setId(UUID.fromString("00000000-0000-0000-0000-000000000201"));

        User user = new User();
        user.setId(UUID.randomUUID());
        user.setUsername("amara.jones@example.com");
        user.setPassword("encoded");
        user.setRole(Role.CANDIDATE);
        user.setCandidate(candidate);
        user.setEmailVerified(true);
        return user;
    }
}
