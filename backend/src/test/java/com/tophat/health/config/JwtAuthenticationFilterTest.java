package com.tophat.health.config;

import com.tophat.health.common.CustomUserDetails;
import com.tophat.health.domain.User;
import com.tophat.health.domain.enums.Role;
import com.tophat.health.service.JwtService;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.http.Cookie;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class JwtAuthenticationFilterTest {

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void authenticatesUsingAccessCookieWhenAuthorizationHeaderIsMissing() throws Exception {
        JwtService jwtService = mock(JwtService.class);
        UserDetailsService userDetailsService = mock(UserDetailsService.class);
        JwtAuthenticationFilter filter = new JwtAuthenticationFilter(jwtService, userDetailsService);

        CustomUserDetails userDetails = new CustomUserDetails(user("admin@tophat.com", Role.ADMIN));
        when(jwtService.extractUsername("cookie-token")).thenReturn("admin@tophat.com");
        when(userDetailsService.loadUserByUsername("admin@tophat.com")).thenReturn(userDetails);
        when(jwtService.isTokenValid("cookie-token", userDetails)).thenReturn(true);

        MockHttpServletRequest request = new MockHttpServletRequest();
        request.setCookies(new Cookie(JwtService.ACCESS_COOKIE_NAME, "cookie-token"));
        MockHttpServletResponse response = new MockHttpServletResponse();
        FilterChain chain = new org.springframework.mock.web.MockFilterChain();

        filter.doFilter(request, response, chain);

        assertThat(SecurityContextHolder.getContext().getAuthentication()).isNotNull();
        assertThat(SecurityContextHolder.getContext().getAuthentication().getName()).isEqualTo("admin@tophat.com");
    }

    private User user(String username, Role role) {
        User user = new User();
        user.setUsername(username);
        user.setPassword("encoded");
        user.setRole(role);
        return user;
    }
}
