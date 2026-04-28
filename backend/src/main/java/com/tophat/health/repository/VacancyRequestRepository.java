package com.tophat.health.repository;

import com.tophat.health.domain.VacancyRequest;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface VacancyRequestRepository extends JpaRepository<VacancyRequest, UUID> {
    List<VacancyRequest> findByClientId(UUID clientId);
}
