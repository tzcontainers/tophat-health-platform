package com.tophat.health.service;

import com.tophat.health.common.NotFoundException;
import com.tophat.health.domain.*;
import com.tophat.health.domain.enums.DocumentStatus;
import com.tophat.health.domain.enums.JobStatus;
import com.tophat.health.domain.enums.ScanStatus;
import com.tophat.health.domain.enums.TimesheetStatus;
import com.tophat.health.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional
public class CandidatePortalService {

    private final CandidateRepository candidateRepository;
    private final CandidateProfileRepository candidateProfileRepository;
    private final CandidateAvailabilityRepository candidateAvailabilityRepository;
    private final CandidateDocumentRepository candidateDocumentRepository;
    private final ComplianceRequirementRepository complianceRequirementRepository;
    private final PlacementRepository placementRepository;
    private final TimesheetRepository timesheetRepository;
    private final FileStorageService fileStorageService;
    private final JobSearchService jobSearchService;

    public CandidatePortalService(CandidateRepository candidateRepository,
            CandidateProfileRepository candidateProfileRepository,
            CandidateAvailabilityRepository candidateAvailabilityRepository,
            CandidateDocumentRepository candidateDocumentRepository,
            ComplianceRequirementRepository complianceRequirementRepository,
            PlacementRepository placementRepository,
            TimesheetRepository timesheetRepository,
            FileStorageService fileStorageService,
            JobSearchService jobSearchService) {
        this.candidateRepository = candidateRepository;
        this.candidateProfileRepository = candidateProfileRepository;
        this.candidateAvailabilityRepository = candidateAvailabilityRepository;
        this.candidateDocumentRepository = candidateDocumentRepository;
        this.complianceRequirementRepository = complianceRequirementRepository;
        this.placementRepository = placementRepository;
        this.timesheetRepository = timesheetRepository;
        this.fileStorageService = fileStorageService;
        this.jobSearchService = jobSearchService;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getMe(UUID candidateId) {
        Candidate candidate = candidateRepository.findById(candidateId)
                .orElseThrow(() -> new NotFoundException("Candidate not found"));
        CandidateProfile profile = candidateProfileRepository.findById(candidateId)
                .orElse(null);
        return Map.of(
                "id", candidate.getId(),
                "candidateNumber", candidate.getCandidateNumber(),
                "firstName", candidate.getFirstName(),
                "lastName", candidate.getLastName(),
                "email", candidate.getEmail(),
                "phone", value(candidate.getPhone()),
                "dateOfBirth", value(candidate.getDateOfBirth()),
                "status", candidate.getStatus(),
                "profile", profile == null ? Map.of()
                        : Map.of(
                                "summary", value(profile.getSummary()),
                                "primaryDiscipline", value(profile.getPrimaryDiscipline()),
                                "band", value(profile.getBand()),
                                "yearsExperience", value(profile.getYearsExperience()),
                                "currentLocation", value(profile.getCurrentLocation()),
                                "preferredRadiusMiles", value(profile.getPreferredRadiusMiles()),
                                "availabilityStatus", value(profile.getAvailabilityStatus()),
                                "availabilityNotes", value(profile.getAvailabilityNotes()),
                                "availableFrom", value(profile.getAvailableFrom())),
                "availabilityHistory",
                candidateAvailabilityRepository.findByCandidateIdOrderByCreatedAtDesc(candidateId)
                        .stream()
                        .map(entry -> Map.of(
                                "id", entry.getId(),
                                "availableFrom", entry.getAvailableFrom(),
                                "availabilityType", entry.getAvailabilityType(),
                                "notes", value(entry.getNotes())))
                        .collect(Collectors.toList()));
    }

    public Map<String, Object> updateProfile(UUID candidateId, Map<String, Object> request) {
        Candidate candidate = candidateRepository.findById(candidateId)
                .orElseThrow(() -> new NotFoundException("Candidate not found"));
        CandidateProfile profile = candidateProfileRepository.findById(candidateId)
                .orElseGet(() -> {
                    CandidateProfile created = new CandidateProfile();
                    created.setCandidate(candidate);
                    created.setCandidateId(candidate.getId());
                    return created;
                });
        candidate.setFirstName((String) request.getOrDefault("firstName", candidate.getFirstName()));
        candidate.setLastName((String) request.getOrDefault("lastName", candidate.getLastName()));
        candidate.setEmail((String) request.getOrDefault("email", candidate.getEmail()));
        candidate.setPhone((String) request.getOrDefault("phone", candidate.getPhone()));
        if (request.containsKey("dateOfBirth")) {
            candidate.setDateOfBirth(LocalDate.parse((String) request.get("dateOfBirth")));
        }
        profile.setSummary((String) request.getOrDefault("summary", profile.getSummary()));
        profile.setPrimaryDiscipline(
                (String) request.getOrDefault("primaryDiscipline", profile.getPrimaryDiscipline()));
        profile.setBand((String) request.getOrDefault("band", profile.getBand()));
        profile.setCurrentLocation((String) request.getOrDefault("currentLocation", profile.getCurrentLocation()));
        profile.setAvailabilityStatus(
                (String) request.getOrDefault("availabilityStatus", profile.getAvailabilityStatus()));
        profile.setAvailabilityNotes(
                (String) request.getOrDefault("availabilityNotes", profile.getAvailabilityNotes()));
        candidateRepository.save(candidate);
        candidateProfileRepository.save(profile);
        return getMe(candidateId);
    }

    public Map<String, Object> addAvailability(UUID candidateId, LocalDate availableFrom, String availabilityType,
            String notes) {
        Candidate candidate = candidateRepository.findById(candidateId)
                .orElseThrow(() -> new NotFoundException("Candidate not found"));
        CandidateAvailability availability = new CandidateAvailability();
        availability.setId(UUID.randomUUID());
        availability.setCandidate(candidate);
        availability.setAvailableFrom(availableFrom);
        availability.setAvailabilityType(availabilityType);
        availability.setNotes(notes);
        candidateAvailabilityRepository.save(availability);

        CandidateProfile profile = candidateProfileRepository.findById(candidateId)
                .orElse(null);
        if (profile != null) {
            profile.setAvailableFrom(availableFrom);
            profile.setAvailabilityStatus(availabilityType);
            profile.setAvailabilityNotes(notes);
            candidateProfileRepository.save(profile);
        }
        return Map.of("id", availability.getId(), "availableFrom", availability.getAvailableFrom(), "availabilityType",
                availability.getAvailabilityType());
    }

    @Transactional(readOnly = true)
    public Map<String, Object> matchedJobs(UUID candidateId, String search, String discipline, String band,
            String employmentType, String location, BigDecimal minPay, BigDecimal maxPay, int page, int size) {
        Candidate candidate = candidateRepository.findById(candidateId)
                .orElseThrow(() -> new NotFoundException("Candidate not found"));
        CandidateProfile profile = candidateProfileRepository.findById(candidate.getId())
                .orElse(null);

        String effectiveDiscipline = firstText(discipline, profile != null ? profile.getPrimaryDiscipline() : null);
        String effectiveBand = firstText(band, profile != null ? profile.getBand() : null);
        String effectiveLocation = firstText(location, profile != null ? profile.getCurrentLocation() : null);

        return jobSearchService.search(new JobSearchCriteria(search, effectiveDiscipline, effectiveBand,
                employmentType, effectiveLocation, minPay, maxPay, JobStatus.PUBLISHED, null, page, size));
    }

    @Transactional(readOnly = true)
    public Map<String, Object> complianceDashboard(UUID candidateId) {
        List<CandidateDocument> documents = candidateDocumentRepository.findByCandidateId(candidateId);
        List<ComplianceRequirement> requirements = complianceRequirementRepository.findAll();
        long approvedCount = documents.stream()
                .filter(document -> document.getVerificationStatus() == DocumentStatus.APPROVED)
                .count();
        String overallStatus = approvedCount >= 2 ? "PARTIALLY_CLEARED" : "ACTION_REQUIRED";
        if (!requirements.isEmpty() && approvedCount == requirements.size()) {
            overallStatus = "CLEARED";
        }
        return Map.of(
                "overallStatus", overallStatus,
                "approvedCount", approvedCount,
                "requirements", requirements.stream()
                        .map(requirement -> Map.of(
                                "id", requirement.getId(),
                                "code", requirement.getCode(),
                                "name", requirement.getName(),
                                "mandatory", requirement.isMandatory(),
                                "validityDays", value(requirement.getValidityDays())))
                        .collect(Collectors.toList()),
                "documents", documents.stream()
                        .map(document -> Map.of(
                                "id", document.getId(),
                                "requirementId", document.getRequirement()
                                        .getId(),
                                "requirementName", document.getRequirement()
                                        .getName(),
                                "documentType", document.getDocumentType(),
                                "filename", document.getOriginalFilename(),
                                "expiryDate", value(document.getExpiryDate()),
                                "scanStatus", document.getScanStatus(),
                                "verificationStatus", document.getVerificationStatus(),
                                "reviewNotes", value(document.getReviewNotes())))
                        .collect(Collectors.toList()));
    }

    public Map<String, Object> uploadDocument(UUID candidateId, UUID requirementId, LocalDate expiryDate,
            MultipartFile file) {
        Candidate candidate = candidateRepository.findById(candidateId)
                .orElseThrow(() -> new NotFoundException("Candidate not found"));
        ComplianceRequirement requirement = complianceRequirementRepository.findById(requirementId)
                .orElseThrow(() -> new NotFoundException("Requirement not found"));
        CandidateDocument document = new CandidateDocument();
        document.setId(UUID.randomUUID());
        document.setCandidate(candidate);
        document.setRequirement(requirement);
        document.setDocumentType(requirement.getCode());
        document.setFileKey(fileStorageService.save(file, "candidate-documents"));
        document.setOriginalFilename(file.getOriginalFilename());
        document.setMimeType(file.getContentType() == null ? "application/octet-stream" : file.getContentType());
        document.setExpiryDate(expiryDate);
        document.setScanStatus(ScanStatus.CLEAN);
        document.setVerificationStatus(DocumentStatus.PENDING);
        document.setReviewNotes("Awaiting review");
        candidateDocumentRepository.save(document);
        return Map.of("id", document.getId(), "filename", document.getOriginalFilename(), "verificationStatus",
                document.getVerificationStatus());
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> placements(UUID candidateId) {
        return placementRepository.findByCandidateId(candidateId)
                .stream()
                .map(placement -> Map.of(
                        "id", placement.getId(),
                        "jobTitle", placement.getJobPosting()
                                .getTitle(),
                        "clientName", placement.getClient()
                                .getName(),
                        "siteName", value(placement.getSite() != null ? placement.getSite()
                                .getSiteName() : null),
                        "consultantName", placement.getConsultantName(),
                        "status", placement.getPlacementStatus(),
                        "startDate", placement.getStartDate(),
                        "endDate", value(placement.getEndDate()),
                        "payRate", placement.getPayRate(),
                        "chargeRate", placement.getChargeRate()))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> timesheets(UUID candidateId) {
        return timesheetRepository.findByPlacementCandidateId(candidateId)
                .stream()
                .map(this::toTimesheetMap)
                .collect(Collectors.toList());
    }

    public Map<String, Object> submitTimesheet(UUID candidateId, UUID placementId, LocalDate weekCommencing,
            List<Map<String, Object>> linesPayload) {
        Placement placement = placementRepository.findById(placementId)
                .orElseThrow(() -> new NotFoundException("Placement not found"));
        if (!placement.getCandidate()
                .getId()
                .equals(candidateId)) {
            throw new IllegalArgumentException("Placement does not belong to candidate");
        }
        Timesheet timesheet = new Timesheet();
        timesheet.setId(UUID.randomUUID());
        timesheet.setPlacement(placement);
        timesheet.setWeekCommencing(weekCommencing);
        timesheet.setSubmissionStatus(TimesheetStatus.PENDING_APPROVAL);
        timesheet.setSubmittedAt(OffsetDateTime.now());
        BigDecimal total = BigDecimal.ZERO;
        for (Map<String, Object> linePayload : linesPayload) {
            TimesheetLine line = new TimesheetLine();
            line.setId(UUID.randomUUID());
            line.setTimesheet(timesheet);
            line.setShiftDate(LocalDate.parse((String) linePayload.get("shiftDate")));
            line.setStartTime(java.time.LocalTime.parse((String) linePayload.get("startTime")));
            line.setEndTime(java.time.LocalTime.parse((String) linePayload.get("endTime")));
            line.setBreakMinutes((Integer) linePayload.getOrDefault("breakMinutes", 0));
            BigDecimal hours = new BigDecimal(linePayload.get("hoursWorked")
                    .toString());
            line.setHoursWorked(hours);
            total = total.add(hours);
            timesheet.getLines()
                    .add(line);
        }
        timesheet.setTotalHours(total);
        timesheetRepository.save(timesheet);
        return toTimesheetMap(timesheet);
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> messages() {
        return List.of(
                Map.of("id", UUID.fromString("00000000-0000-0000-0000-000000009001"), "from", "Sophie Recruiter",
                        "subject", "Welcome to TopHat", "body",
                        "Thanks for joining TopHat Health Care. Please complete your compliance uploads.", "sentAt",
                        OffsetDateTime.now()
                                .minusDays(5)),
                Map.of("id", UUID.fromString("00000000-0000-0000-0000-000000009002"), "from", "Compliance Team",
                        "subject", "NMC registration review", "body",
                        "We need one more supporting document before we can approve your NMC registration.", "sentAt",
                        OffsetDateTime.now()
                                .minusDays(1)));
    }

    private Map<String, Object> toTimesheetMap(Timesheet timesheet) {
        return Map.of(
                "id", timesheet.getId(),
                "placementId", timesheet.getPlacement()
                        .getId(),
                "weekCommencing", timesheet.getWeekCommencing(),
                "status", timesheet.getSubmissionStatus(),
                "submittedAt", value(timesheet.getSubmittedAt()),
                "approvedAt", value(timesheet.getApprovedAt()),
                "rejectedAt", value(timesheet.getRejectedAt()),
                "approvalComment", value(timesheet.getApprovalComment()),
                "totalHours", timesheet.getTotalHours(),
                "lines", timesheet.getLines()
                        .stream()
                        .map(line -> Map.of(
                                "id", line.getId(),
                                "shiftDate", line.getShiftDate(),
                                "startTime", line.getStartTime()
                                        .toString(),
                                "endTime", line.getEndTime()
                                        .toString(),
                                "breakMinutes", line.getBreakMinutes(),
                                "hoursWorked", line.getHoursWorked()))
                        .collect(Collectors.toList()));
    }

    private Object value(Object value) {
        return value == null ? "" : value;
    }

    private String firstText(String preferred, String fallback) {
        if (preferred != null && !preferred.isBlank()) {
            return preferred;
        }
        return fallback;
    }
}
