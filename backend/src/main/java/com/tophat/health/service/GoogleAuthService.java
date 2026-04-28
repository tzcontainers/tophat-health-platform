package com.tophat.health.service;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import com.tophat.health.common.CustomUserDetails;
import com.tophat.health.domain.Candidate;
import com.tophat.health.domain.CandidateProfile;
import com.tophat.health.domain.User;
import com.tophat.health.domain.enums.CandidateStatus;
import com.tophat.health.domain.enums.Role;
import com.tophat.health.repository.CandidateProfileRepository;
import com.tophat.health.repository.CandidateRepository;
import com.tophat.health.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.security.GeneralSecurityException;
import java.util.Collections;
import java.util.Locale;
import java.util.UUID;

@Service
@Transactional
public class GoogleAuthService {

    private final UserRepository userRepository;
    private final CandidateRepository candidateRepository;
    private final CandidateProfileRepository candidateProfileRepository;
    private final PasswordEncoder passwordEncoder;
    private final GoogleIdTokenVerifier verifier;

    public GoogleAuthService(
            UserRepository userRepository,
            CandidateRepository candidateRepository,
            CandidateProfileRepository candidateProfileRepository,
            PasswordEncoder passwordEncoder,
            @Value("${app.security.google.client-id:}") String googleClientId
    ) {
        this.userRepository = userRepository;
        this.candidateRepository = candidateRepository;
        this.candidateProfileRepository = candidateProfileRepository;
        this.passwordEncoder = passwordEncoder;
        this.verifier = googleClientId == null || googleClientId.isBlank()
                ? null
                : new GoogleIdTokenVerifier.Builder(new NetHttpTransport(), GsonFactory.getDefaultInstance())
                .setAudience(Collections.singletonList(googleClientId))
                .build();
    }

    public CustomUserDetails authenticate(String credential) {
        if (verifier == null) {
            throw new IllegalStateException("Google sign-in is not configured.");
        }

        GoogleIdToken.Payload payload = verify(credential);
        String googleSubject = payload.getSubject();
        String email = payload.getEmail() == null ? "" : payload.getEmail().toLowerCase(Locale.ROOT);

        if (email.isBlank() || !Boolean.TRUE.equals(payload.getEmailVerified())) {
            throw new IllegalArgumentException("Google account email must be verified.");
        }

        User user = userRepository.findByGoogleSubject(googleSubject)
                .or(() -> userRepository.findByUsername(email))
                .map(existing -> linkGoogleAccount(existing, googleSubject))
                .orElseGet(() -> createCandidateUser(payload, email, googleSubject));

        return new CustomUserDetails(user);
    }

    private GoogleIdToken.Payload verify(String credential) {
        try {
            GoogleIdToken idToken = verifier.verify(credential);
            if (idToken == null) {
                throw new IllegalArgumentException("Invalid Google credential.");
            }
            return idToken.getPayload();
        } catch (GeneralSecurityException | IOException error) {
            throw new IllegalArgumentException("Could not verify Google credential.", error);
        }
    }

    private User linkGoogleAccount(User user, String googleSubject) {
        if (user.getGoogleSubject() != null && !user.getGoogleSubject().equals(googleSubject)) {
            throw new IllegalArgumentException("This email is linked to a different Google account.");
        }
        user.setAuthProvider("GOOGLE");
        user.setGoogleSubject(googleSubject);
        user.setEmailVerified(true);
        return userRepository.save(user);
    }

    private User createCandidateUser(GoogleIdToken.Payload payload, String email, String googleSubject) {
        Candidate candidate = new Candidate();
        candidate.setId(UUID.randomUUID());
        candidate.setCandidateNumber("CAND-" + System.currentTimeMillis());
        candidate.setFirstName(namePart(payload, "given_name", "Google"));
        candidate.setLastName(namePart(payload, "family_name", "Candidate"));
        candidate.setEmail(email);
        candidate.setStatus(CandidateStatus.ACTIVE);
        candidateRepository.save(candidate);

        CandidateProfile profile = new CandidateProfile();
        profile.setCandidate(candidate);
        profile.setCandidateId(candidate.getId());
        profile.setSummary("Created through Google sign-in.");
        profile.setAvailabilityStatus("NEW");
        candidateProfileRepository.save(profile);

        User user = new User();
        user.setId(UUID.randomUUID());
        user.setUsername(email);
        user.setPassword(passwordEncoder.encode(UUID.randomUUID().toString()));
        user.setRole(Role.CANDIDATE);
        user.setCandidate(candidate);
        user.setAuthProvider("GOOGLE");
        user.setGoogleSubject(googleSubject);
        user.setEmailVerified(true);
        return userRepository.save(user);
    }

    private String namePart(GoogleIdToken.Payload payload, String claim, String fallback) {
        Object value = payload.get(claim);
        return value == null || value.toString().isBlank() ? fallback : value.toString();
    }
}
