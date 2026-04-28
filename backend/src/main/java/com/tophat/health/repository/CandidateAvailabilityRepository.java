package com.tophat.health.repository;

import com.tophat.health.domain.CandidateAvailability;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface CandidateAvailabilityRepository extends JpaRepository<CandidateAvailability, UUID> {
    List<CandidateAvailability> findByCandidateIdOrderByCreatedAtDesc(UUID candidateId);
}
