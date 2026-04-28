package com.tophat.health.service;

import com.tophat.health.common.NotFoundException;
import com.tophat.health.domain.*;
import com.tophat.health.domain.enums.DocumentStatus;
import com.tophat.health.domain.enums.JobStatus;
import com.tophat.health.domain.enums.PlacementStatus;
import com.tophat.health.domain.enums.Role;
import com.tophat.health.repository.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
public class AdminService {

    private final CandidateRepository candidateRepository;
    private final JobPostingRepository jobPostingRepository;
    private final ClientRepository clientRepository;
    private final ClientSiteRepository clientSiteRepository;
    private final PlacementRepository placementRepository;
    private final CandidateDocumentRepository candidateDocumentRepository;
    private final TimesheetRepository timesheetRepository;
    private final UserRepository userRepository;
    private final TeamRepository teamRepository;
    private final TeamMemberRepository teamMemberRepository;
    private final PasswordEncoder passwordEncoder;

    public AdminService(CandidateRepository candidateRepository,
                        JobPostingRepository jobPostingRepository,
                        ClientRepository clientRepository,
                        ClientSiteRepository clientSiteRepository,
                        PlacementRepository placementRepository,
                        CandidateDocumentRepository candidateDocumentRepository,
                        TimesheetRepository timesheetRepository,
                        UserRepository userRepository,
                        TeamRepository teamRepository,
                        TeamMemberRepository teamMemberRepository,
                        PasswordEncoder passwordEncoder) {
        this.candidateRepository = candidateRepository;
        this.jobPostingRepository = jobPostingRepository;
        this.clientRepository = clientRepository;
        this.clientSiteRepository = clientSiteRepository;
        this.placementRepository = placementRepository;
        this.candidateDocumentRepository = candidateDocumentRepository;
        this.timesheetRepository = timesheetRepository;
        this.userRepository = userRepository;
        this.teamRepository = teamRepository;
        this.teamMemberRepository = teamMemberRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> candidates() {
        return candidateRepository.findAll()
                .stream()
                .map(candidate -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("id", candidate.getId());
                    map.put("candidateNumber", candidate.getCandidateNumber());
                    map.put("name", candidate.getFirstName() + " " + candidate.getLastName());
                    map.put("email", candidate.getEmail());
                    map.put("status", candidate.getStatus());
                    return map;
                })
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Map<String, Object> candidate(UUID candidateId) {
        Candidate candidate = candidateRepository.findById(candidateId)
                .orElseThrow(() -> new NotFoundException("Candidate not found"));
        
        Map<String, Object> map = new HashMap<>();
        map.put("id", candidate.getId());
        map.put("candidateNumber", candidate.getCandidateNumber());
        map.put("name", candidate.getFirstName() + " " + candidate.getLastName());
        map.put("email", candidate.getEmail());
        map.put("status", candidate.getStatus());
        map.put("documents", candidateDocumentRepository.findByCandidateId(candidateId)
                .stream()
                .map(document -> {
                    Map<String, Object> d = new HashMap<>();
                    d.put("id", document.getId());
                    d.put("requirementName", document.getRequirement().getName());
                    d.put("verificationStatus", document.getVerificationStatus());
                    d.put("reviewNotes", value(document.getReviewNotes()));
                    return d;
                })
                .collect(Collectors.toList()));
        return map;
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> jobs() {
        return jobPostingRepository.findAll()
                .stream()
                .map(job -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("id", job.getId());
                    map.put("title", job.getTitle());
                    map.put("discipline", job.getDiscipline());
                    map.put("band", value(job.getBand()));
                    map.put("status", job.getVacancyStatus());
                    map.put("clientName", job.getClient().getName());
                    return map;
                })
                .collect(Collectors.toList());
    }

    public Map<String, Object> createJob(Map<String, Object> payload) {
        Client client = clientRepository.findById(UUID.fromString(payload.get("clientId")
                        .toString()))
                .orElseThrow(() -> new NotFoundException("Client not found"));
        ClientSite site = payload.get("siteId") == null || payload.get("siteId")
                .toString()
                .isBlank() ? null : clientSiteRepository.findById(UUID.fromString(payload.get("siteId")
                        .toString()))
                .orElse(null);
        JobPosting job = new JobPosting();
        job.setId(UUID.randomUUID());
        job.setClient(client);
        job.setSite(site);
        job.setTitle(payload.get("title")
                .toString());
        job.setDiscipline(payload.get("discipline")
                .toString());
        job.setBand((String) payload.getOrDefault("band", "Band 5"));
        job.setEmploymentType((String) payload.getOrDefault("employmentType", "LOCUM"));
        job.setDescription(payload.get("description")
                .toString());
        job.setLocationText((String) payload.getOrDefault("location", site != null ? site.getCity() : ""));
        job.setPayRateMin(new BigDecimal(payload.getOrDefault("payRateMin", 20)
                .toString()));
        job.setPayRateMax(new BigDecimal(payload.getOrDefault("payRateMax", 30)
                .toString()));
        job.setVacancyStatus(JobStatus.valueOf(payload.getOrDefault("status", "PUBLISHED")
                .toString()));
        job.setPublishedAt(OffsetDateTime.now());
        jobPostingRepository.save(job);
        return Map.of("id", job.getId(), "title", job.getTitle(), "status", job.getVacancyStatus());
    }

    public Map<String, Object> updateJob(UUID jobId, Map<String, Object> payload) {
        JobPosting job = jobPostingRepository.findById(jobId)
                .orElseThrow(() -> new NotFoundException("Job not found"));
        if (payload.containsKey("title")) {
            job.setTitle(payload.get("title")
                    .toString());
        }
        if (payload.containsKey("discipline")) {
            job.setDiscipline(payload.get("discipline")
                    .toString());
        }
        if (payload.containsKey("band")) {
            job.setBand(payload.get("band")
                    .toString());
        }
        if (payload.containsKey("description")) {
            job.setDescription(payload.get("description")
                    .toString());
        }
        if (payload.containsKey("location")) {
            job.setLocationText(payload.get("location")
                    .toString());
        }
        if (payload.containsKey("status")) {
            job.setVacancyStatus(JobStatus.valueOf(payload.get("status")
                    .toString()));
        }
        jobPostingRepository.save(job);
        return Map.of("id", job.getId(), "status", job.getVacancyStatus(), "title", job.getTitle());
    }

    public Map<String, Object> createPlacement(Map<String, Object> payload) {
        Candidate candidate = candidateRepository.findById(UUID.fromString(payload.get("candidateId")
                        .toString()))
                .orElseThrow(() -> new NotFoundException("Candidate not found"));
        JobPosting job = jobPostingRepository.findById(UUID.fromString(payload.get("jobId")
                        .toString()))
                .orElseThrow(() -> new NotFoundException("Job not found"));
        Client client = clientRepository.findById(UUID.fromString(payload.get("clientId")
                        .toString()))
                .orElseThrow(() -> new NotFoundException("Client not found"));
        ClientSite site = payload.get("siteId") == null || payload.get("siteId")
                .toString()
                .isBlank() ? null : clientSiteRepository.findById(UUID.fromString(payload.get("siteId")
                        .toString()))
                .orElse(null);
        Placement placement = new Placement();
        placement.setId(UUID.randomUUID());
        placement.setCandidate(candidate);
        placement.setJobPosting(job);
        placement.setClient(client);
        placement.setSite(site);
        placement.setConsultantName((String) payload.getOrDefault("consultantName", "TopHat Consultant"));
        placement.setStartDate(LocalDate.parse(payload.getOrDefault("startDate", LocalDate.now()
                        .toString())
                .toString()));
        placement.setEndDate(payload.get("endDate") == null || payload.get("endDate")
                .toString()
                .isBlank() ? null : LocalDate.parse(payload.get("endDate")
                .toString()));
        placement.setPlacementStatus(PlacementStatus.valueOf(payload.getOrDefault("status", "ACTIVE")
                .toString()));
        placement.setPayRate(new BigDecimal(payload.getOrDefault("payRate", 30)
                .toString()));
        placement.setChargeRate(new BigDecimal(payload.getOrDefault("chargeRate", 45)
                .toString()));
        placementRepository.save(placement);
        return Map.of("id", placement.getId(), "status", placement.getPlacementStatus(), "candidateName", candidate.getFirstName() + " " + candidate.getLastName());
    }

    public Map<String, Object> reviewCompliance(UUID documentId, String status, String notes) {
        CandidateDocument document = candidateDocumentRepository.findById(documentId)
                .orElseThrow(() -> new NotFoundException("Document not found"));
        document.setVerificationStatus(DocumentStatus.valueOf(status));
        document.setReviewNotes(notes);
        document.setReviewedAt(OffsetDateTime.now());
        candidateDocumentRepository.save(document);
        return Map.of("id", document.getId(), "status", document.getVerificationStatus(), "reviewNotes", value(document.getReviewNotes()));
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> timesheets() {
        return timesheetRepository.findAll()
                .stream()
                .map(timesheet -> {
                    Placement placement = timesheet.getPlacement();
                    Candidate candidate = placement != null ? placement.getCandidate() : null;
                    Client client = placement != null ? placement.getClient() : null;

                    Map<String, Object> map = new HashMap<>();
                    map.put("id", timesheet.getId());
                    map.put("candidateName", candidate != null ? candidate.getFirstName() + " " + candidate.getLastName() : "");
                    map.put("clientName", client != null ? client.getName() : "");
                    map.put("weekCommencing", value(timesheet.getWeekCommencing()));
                    map.put("status", timesheet.getSubmissionStatus());
                    map.put("totalHours", value(timesheet.getTotalHours()));
                    return map;
                })
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> complianceReport() {
        return candidateDocumentRepository.findAll()
                .stream()
                .map(document -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("documentId", document.getId());
                    map.put("candidateName", document.getCandidate().getFirstName() + " " + document.getCandidate().getLastName());
                    map.put("requirement", document.getRequirement().getName());
                    map.put("status", document.getVerificationStatus());
                    map.put("expiryDate", value(document.getExpiryDate()));
                    map.put("reviewNotes", value(document.getReviewNotes()));
                    return map;
                })
                .collect(Collectors.toList());
    }

    public Map<String, Object> sendNotification(String audience, String subject, String body) {
        return Map.of("status", "QUEUED", "audience", audience, "subject", subject, "body", body, "timestamp", OffsetDateTime.now());
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> users() {
        return userRepository.findAll()
                .stream()
                .map(user -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("id", user.getId());
                    map.put("username", user.getUsername());
                    map.put("role", user.getRole().name()); // Fix: Use .name() for Enum
                    map.put("createdAt", user.getCreatedAt() != null ? user.getCreatedAt().toString() : OffsetDateTime.now().toString());
                    return map;
                })
                .collect(Collectors.toList());
    }

    public Map<String, Object> createUser(String username, String password, String role) {
        if (username == null || username.isBlank()) {
            throw new IllegalArgumentException("Username is required");
        }
        if (userRepository.findByUsername(username).isPresent()) {
            throw new IllegalArgumentException("Username already exists");
        }

        Role parsedRole = Role.valueOf(role);
        User user = new User();
        user.setId(UUID.randomUUID());
        user.setUsername(username.trim().toLowerCase());
        user.setPassword(passwordEncoder.encode(password == null || password.isBlank() ? UUID.randomUUID().toString() : password));
        user.setRole(parsedRole);
        user.setAuthProvider("LOCAL");
        user.setEmailVerified(true);
        userRepository.save(user);

        return Map.of("id", user.getId(), "username", user.getUsername(), "role", user.getRole().name());
    }

    public Map<String, Object> updateUserRole(UUID userId, String role) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new com.tophat.health.common.NotFoundException("User not found"));
        user.setRole(Role.valueOf(role));
        userRepository.save(user);
        return Map.of("id", user.getId(), "username", user.getUsername(), "role", user.getRole().name());
    }

    public Map<String, Object> assignAdmin(UUID userId) {
        return updateUserRole(userId, "ADMIN");
    }

    public Map<String, Object> deleteUser(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new com.tophat.health.common.NotFoundException("User not found"));
        if (user.getRole() == Role.ADMIN && userRepository.findAll()
                .stream()
                .filter(u -> u.getRole() == Role.ADMIN) // Fix: filter on User role
                .count() <= 1) {
            throw new IllegalArgumentException("Cannot delete the last admin user");
        }
        userRepository.delete(user);
        return Map.of("id", userId, "deleted", true);
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getTeams() {
        return teamRepository.findAll()
                .stream()
                .map(team -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("id", team.getId());
                    map.put("name", team.getName());
                    map.put("description", value(team.getDescription()));
                    map.put("memberCount", team.getMembers() != null ? team.getMembers().size() : 0);
                    return map;
                })
                .collect(Collectors.toList());
    }

    public Map<String, Object> createTeam(String name, String description) {
        Team team = new Team();
        team.setId(UUID.randomUUID());
        team.setName(name);
        team.setDescription(description);
        teamRepository.save(team);
        return Map.of("id", team.getId(), "name", team.getName());
    }

    public void deleteTeam(UUID teamId) {
        teamRepository.deleteById(teamId);
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getTeamMembers(UUID teamId) {
        return teamMemberRepository.findByTeamId(teamId)
                .stream()
                .map(member -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("id", member.getId());
                    map.put("userId", member.getUser().getId());
                    map.put("username", member.getUser().getUsername());
                    map.put("role", member.getRole());
                    return map;
                })
                .collect(Collectors.toList());
    }

    public Map<String, Object> addTeamMember(UUID teamId, UUID userId, String role) {
        Team team = teamRepository.findById(teamId).orElseThrow(() -> new NotFoundException("Team not found"));
        User user = userRepository.findById(userId).orElseThrow(() -> new NotFoundException("User not found"));

        TeamMember member = new TeamMember();
        member.setId(UUID.randomUUID());
        member.setTeam(team);
        member.setUser(user);
        member.setRole(role);
        teamMemberRepository.save(member);
        return Map.of("id", member.getId(), "username", user.getUsername());
    }

    public void removeTeamMember(UUID memberId) {
        teamMemberRepository.deleteById(memberId);
    }

    private Object value(Object value) {
        return value == null ? "" : value;
    }
}
