package com.tophat.health.common;

import java.time.Instant;
import java.util.UUID;

public record ApiEnvelope<T>(T data, Meta meta) {
    public static <T> ApiEnvelope<T> of(T data) {
        return new ApiEnvelope<>(data, new Meta(UUID.randomUUID()
                                                    .toString(), Instant.now()
                                                                        .toString()));
    }

    public record Meta(String correlationId, String timestamp) {
    }
}
