package com.tophat.health.repository;

import com.tophat.health.domain.Timesheet;
import com.tophat.health.domain.enums.TimesheetStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface TimesheetRepository extends JpaRepository<Timesheet, UUID> {
    List<Timesheet> findByPlacementCandidateId(UUID candidateId);

    List<Timesheet> findByPlacementClientIdAndSubmissionStatus(UUID clientId, TimesheetStatus status);
}
