package com.tophat.health.service;

import com.tophat.health.common.NotFoundException;
import com.tophat.health.domain.Client;
import com.tophat.health.domain.ClientSite;
import com.tophat.health.domain.Timesheet;
import com.tophat.health.domain.VacancyRequest;
import com.tophat.health.domain.enums.JobStatus;
import com.tophat.health.domain.enums.TimesheetStatus;
import com.tophat.health.domain.enums.VacancyRequestStatus;
import com.tophat.health.repository.ClientRepository;
import com.tophat.health.repository.ClientSiteRepository;
import com.tophat.health.repository.PlacementRepository;
import com.tophat.health.repository.TimesheetRepository;
import com.tophat.health.repository.VacancyRequestRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
public class ClientPortalService {

    private final JobSearchService jobSearchService;
    private final ClientRepository clientRepository;
    private final ClientSiteRepository clientSiteRepository;
    private final PlacementRepository placementRepository;
    private final TimesheetRepository timesheetRepository;
    private final VacancyRequestRepository vacancyRequestRepository;

    public ClientPortalService(JobSearchService jobSearchService,
            ClientRepository clientRepository,
            ClientSiteRepository clientSiteRepository,
            PlacementRepository placementRepository,
            TimesheetRepository timesheetRepository,
            VacancyRequestRepository vacancyRequestRepository) {
        this.jobSearchService = jobSearchService;
        this.clientRepository = clientRepository;
        this.clientSiteRepository = clientSiteRepository;
        this.placementRepository = placementRepository;
        this.timesheetRepository = timesheetRepository;
        this.vacancyRequestRepository = vacancyRequestRepository;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> jobs(UUID clientId, String search, String discipline, String band, String employmentType,
            String location, BigDecimal minPay, BigDecimal maxPay, JobStatus status, int page, int size) {
        return jobSearchService.search(new JobSearchCriteria(search, discipline, band, employmentType, location,
                minPay, maxPay, status, clientId, page, size));
    }

    public Map<String, Object> createVacancyRequest(UUID clientId, UUID siteId, String title, String discipline, String band, String shiftPattern, String notes) {
        Client client = clientRepository.findById(clientId)
                                        .orElseThrow(() -> new NotFoundException("Client not found"));
        ClientSite site = siteId == null ? null : clientSiteRepository.findById(siteId)
                                                                      .orElse(null);
        VacancyRequest request = new VacancyRequest();
        request.setId(UUID.randomUUID());
        request.setClient(client);
        request.setSite(site);
        request.setTitle(title);
        request.setDiscipline(discipline);
        request.setBand(band);
        request.setShiftPattern(shiftPattern);
        request.setNotes(notes);
        request.setVacancyStatus(VacancyRequestStatus.OPEN);
        vacancyRequestRepository.save(request);
        return Map.of("id", request.getId(), "status", request.getVacancyStatus(), "createdAt", OffsetDateTime.now());
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> placements(UUID clientId) {
        return placementRepository.findByClientId(clientId)
                                  .stream()
                                  .map(placement -> Map.of(
                                          "id", placement.getId(),
                                          "candidateName", placement.getCandidate()
                                                                    .getFirstName() + " " + placement.getCandidate()
                                                                                                     .getLastName(),
                                          "jobTitle", placement.getJobPosting()
                                                               .getTitle(),
                                          "siteName", value(placement.getSite() != null ? placement.getSite()
                                                                                                   .getSiteName() : null),
                                          "status", placement.getPlacementStatus(),
                                          "startDate", placement.getStartDate(),
                                          "endDate", value(placement.getEndDate()),
                                          "chargeRate", placement.getChargeRate()
                                  ))
                                  .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> pendingTimesheets(UUID clientId) {
        return timesheetRepository.findByPlacementClientIdAndSubmissionStatus(clientId, TimesheetStatus.PENDING_APPROVAL)
                                  .stream()
                                  .map(timesheet -> Map.of(
                                          "id", timesheet.getId(),
                                          "candidateName", timesheet.getPlacement()
                                                                    .getCandidate()
                                                                    .getFirstName() + " " + timesheet.getPlacement()
                                                                                                     .getCandidate()
                                                                                                     .getLastName(),
                                          "weekCommencing", timesheet.getWeekCommencing(),
                                          "totalHours", timesheet.getTotalHours(),
                                          "comment", value(timesheet.getApprovalComment())
                                  ))
                                  .collect(Collectors.toList());
    }

    public Map<String, Object> approve(UUID clientId, UUID timesheetId, String comment) {
        Timesheet timesheet = timesheetRepository.findById(timesheetId)
                                                 .orElseThrow(() -> new NotFoundException("Timesheet not found"));
        if (!timesheet.getPlacement()
                      .getClient()
                      .getId()
                      .equals(clientId)) {
            throw new IllegalArgumentException("Timesheet does not belong to client");
        }
        timesheet.setSubmissionStatus(TimesheetStatus.APPROVED);
        timesheet.setApprovedAt(OffsetDateTime.now());
        timesheet.setApprovalComment(comment == null ? "Approved by client" : comment);
        timesheet.setLockedForPayroll(true);
        timesheetRepository.save(timesheet);
        return Map.of("id", timesheet.getId(), "status", timesheet.getSubmissionStatus(), "approvedAt", timesheet.getApprovedAt());
    }

    public Map<String, Object> reject(UUID clientId, UUID timesheetId, String comment) {
        Timesheet timesheet = timesheetRepository.findById(timesheetId)
                                                 .orElseThrow(() -> new NotFoundException("Timesheet not found"));
        if (!timesheet.getPlacement()
                      .getClient()
                      .getId()
                      .equals(clientId)) {
            throw new IllegalArgumentException("Timesheet does not belong to client");
        }
        timesheet.setSubmissionStatus(TimesheetStatus.REJECTED);
        timesheet.setRejectedAt(OffsetDateTime.now());
        timesheet.setApprovalComment(comment == null ? "Rejected by client" : comment);
        timesheetRepository.save(timesheet);
        return Map.of("id", timesheet.getId(), "status", timesheet.getSubmissionStatus(), "rejectedAt", timesheet.getRejectedAt(), "comment", timesheet.getApprovalComment());
    }

    private Object value(Object value) {
        return value == null ? "" : value;
    }
}
