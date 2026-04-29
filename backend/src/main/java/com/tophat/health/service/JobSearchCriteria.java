package com.tophat.health.service;

import com.tophat.health.domain.enums.JobStatus;

import java.math.BigDecimal;
import java.util.UUID;

public record JobSearchCriteria(
        String search,
        String discipline,
        String band,
        String employmentType,
        String location,
        BigDecimal minPay,
        BigDecimal maxPay,
        JobStatus status,
        UUID clientId,
        int page,
        int size
) {
}
