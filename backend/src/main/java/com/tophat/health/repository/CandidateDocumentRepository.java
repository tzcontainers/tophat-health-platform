package com.tophat.health.repository;

import com.tophat.health.domain.CandidateDocument;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface CandidateDocumentRepository extends JpaRepository<CandidateDocument, UUID> {
    List<CandidateDocument> findByCandidateId(UUID candidateId);
}
