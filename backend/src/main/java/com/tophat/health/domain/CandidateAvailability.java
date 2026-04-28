package com.tophat.health.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "candidate_availability")
@Getter
@Setter
public class CandidateAvailability {
    @Id
    private UUID id;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "candidate_id", nullable = false)
    private Candidate candidate;
    @Column(name = "available_from", nullable = false)
    private LocalDate availableFrom;
    @Column(name = "availability_type", nullable = false)
    private String availabilityType;
    @Column(columnDefinition = "text")
    private String notes;
    @Column(name = "created_at", insertable = false, updatable = false)
    private OffsetDateTime createdAt;
}
