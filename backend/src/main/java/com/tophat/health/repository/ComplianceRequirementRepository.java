package com.tophat.health.repository;

import com.tophat.health.domain.ComplianceRequirement;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface ComplianceRequirementRepository extends JpaRepository<ComplianceRequirement, UUID> {
}
