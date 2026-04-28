package com.tophat.health.repository;

import com.tophat.health.domain.CandidateProfile;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface CandidateProfileRepository extends JpaRepository<CandidateProfile, UUID> {
}
