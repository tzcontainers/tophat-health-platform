package com.tophat.health.common;

import org.springframework.stereotype.Component;

import java.util.Optional;
import java.util.UUID;

@Component
public class DevRequestContext {
    public static final UUID DEFAULT_CANDIDATE_ID = UUID.fromString("00000000-0000-0000-0000-000000000201");
    public static final UUID DEFAULT_CLIENT_ID = UUID.fromString("00000000-0000-0000-0000-000000000301");

    public UUID candidateId(String headerValue) {
        return Optional.ofNullable(headerValue)
                       .filter(v -> !v.isBlank())
                       .map(UUID::fromString)
                       .orElse(DEFAULT_CANDIDATE_ID);
    }

    public UUID clientId(String headerValue) {
        return Optional.ofNullable(headerValue)
                       .filter(v -> !v.isBlank())
                       .map(UUID::fromString)
                       .orElse(DEFAULT_CLIENT_ID);
    }
}
