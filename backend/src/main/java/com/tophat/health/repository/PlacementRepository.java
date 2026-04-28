package com.tophat.health.repository;

import com.tophat.health.domain.Placement;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface PlacementRepository extends JpaRepository<Placement, UUID> {
    List<Placement> findByCandidateId(UUID candidateId);

    List<Placement> findByClientId(UUID clientId);
}
