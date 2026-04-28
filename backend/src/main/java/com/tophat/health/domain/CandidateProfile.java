package com.tophat.health.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "candidate_profiles")
@Getter
@Setter
public class CandidateProfile {
    @Id
    @Column(name = "candidate_id")
    private UUID candidateId;
    @OneToOne(fetch = FetchType.LAZY)
    @MapsId
    @JoinColumn(name = "candidate_id")
    private Candidate candidate;
    @Column(columnDefinition = "text")
    private String summary;
    @Column(name = "primary_discipline")
    private String primaryDiscipline;
    private String band;
    @Column(name = "years_experience")
    private Integer yearsExperience;
    @Column(name = "current_location")
    private String currentLocation;
    @Column(name = "preferred_radius_miles")
    private Integer preferredRadiusMiles;
    @Column(name = "availability_status")
    private String availabilityStatus;
    @Column(name = "availability_notes", columnDefinition = "text")
    private String availabilityNotes;
    @Column(name = "available_from")
    private LocalDate availableFrom;
}
