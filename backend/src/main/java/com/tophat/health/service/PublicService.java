package com.tophat.health.service;

import com.tophat.health.common.NotFoundException;
import com.tophat.health.domain.Candidate;
import com.tophat.health.domain.CandidateProfile;
import com.tophat.health.domain.ContactRequest;
import com.tophat.health.domain.JobPosting;
import com.tophat.health.domain.Client;
import com.tophat.health.domain.User;
import com.tophat.health.domain.enums.CandidateStatus;
import com.tophat.health.domain.enums.ClientStatus;
import com.tophat.health.domain.enums.JobStatus;
import com.tophat.health.domain.enums.Role;
import com.tophat.health.repository.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.Map;
import java.util.UUID;

@Service
@Transactional
public class PublicService {

    private final JobPostingRepository jobPostingRepository;
    private final CandidateRepository candidateRepository;
    private final CandidateProfileRepository candidateProfileRepository;
    private final ContactRequestRepository contactRequestRepository;
    private final ClientRepository clientRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JobSearchService jobSearchService;

    public PublicService(JobPostingRepository jobPostingRepository,
            CandidateRepository candidateRepository,
            CandidateProfileRepository candidateProfileRepository,
            ContactRequestRepository contactRequestRepository,
            ClientRepository clientRepository,
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JobSearchService jobSearchService) {
        this.jobPostingRepository = jobPostingRepository;
        this.candidateRepository = candidateRepository;
        this.candidateProfileRepository = candidateProfileRepository;
        this.contactRequestRepository = contactRequestRepository;
        this.clientRepository = clientRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jobSearchService = jobSearchService;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> listJobs(String search, String discipline, String band, String employmentType,
            String location, BigDecimal minPay, BigDecimal maxPay, int page, int size) {
        return jobSearchService.search(new JobSearchCriteria(search, discipline, band, employmentType, location,
                minPay, maxPay, JobStatus.PUBLISHED, null, page, size));
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getJob(UUID id) {
        JobPosting job = jobPostingRepository.findById(id)
                                             .orElseThrow(() -> new NotFoundException("Job not found"));
        return Map.ofEntries(
                Map.entry("id", job.getId()),
                Map.entry("title", job.getTitle()),
                Map.entry("discipline", job.getDiscipline()),
                Map.entry("band", value(job.getBand())),
                Map.entry("employmentType", job.getEmploymentType()),
                Map.entry("description", job.getDescription()),
                Map.entry("location", value(job.getLocationText())),
                Map.entry("payRateMin", value(job.getPayRateMin())),
                Map.entry("payRateMax", value(job.getPayRateMax())),
                Map.entry("status", job.getVacancyStatus()),
                Map.entry("clientName", job.getClient()
                                           .getName()),
                Map.entry("siteName", value(job.getSite() != null ? job.getSite()
                                                                       .getSiteName() : null)),
                Map.entry("publishedAt", value(job.getPublishedAt())),
                Map.entry("closesAt", value(job.getClosesAt()))
        );
    }

    public Map<String, Object> registerCandidate(String firstName, String lastName, String email, String password, String phone, String discipline) {
        Candidate candidate = new Candidate();
        candidate.setId(UUID.randomUUID());
        candidate.setCandidateNumber("CAND-" + System.currentTimeMillis());
        candidate.setFirstName(firstName);
        candidate.setLastName(lastName);
        candidate.setEmail(email);
        candidate.setPhone(phone);
        candidate.setStatus(CandidateStatus.ACTIVE);
        candidateRepository.save(candidate);

        CandidateProfile profile = new CandidateProfile();
        profile.setCandidate(candidate);
        profile.setCandidateId(candidate.getId());
        profile.setSummary("Newly registered via public site.");
        profile.setPrimaryDiscipline(discipline);
        profile.setAvailabilityStatus("NEW");
        candidateProfileRepository.save(profile);

        User user = new User();
        user.setId(UUID.randomUUID());
        user.setUsername(email);
        user.setPassword(passwordEncoder.encode(password));
        user.setRole(Role.CANDIDATE);
        user.setCandidate(candidate);
        userRepository.save(user);

        return Map.of("candidateId", candidate.getId(), "candidateNumber", candidate.getCandidateNumber(), "status", candidate.getStatus());
    }

    public Map<String, Object> registerClient(String name, String email, String password) {
        Client client = new Client();
        client.setId(UUID.randomUUID());
        client.setClientCode("CLI-" + System.currentTimeMillis());
        client.setName(name);
        client.setStatus(ClientStatus.ACTIVE);
        clientRepository.save(client);

        User user = new User();
        user.setId(UUID.randomUUID());
        user.setUsername(email);
        user.setPassword(passwordEncoder.encode(password));
        user.setRole(Role.CLIENT_ADMIN);
        user.setClient(client);
        userRepository.save(user);

        return Map.of("clientId", client.getId(), "clientCode", client.getClientCode(), "status", client.getStatus());
    }

    public Map<String, Object> createContactRequest(String name, String email, String phone, String message) {
        ContactRequest request = new ContactRequest();
        request.setId(UUID.randomUUID());
        request.setName(name);
        request.setEmail(email);
        request.setPhone(phone);
        request.setMessage(message);
        contactRequestRepository.save(request);
        return Map.of("id", request.getId(), "createdAt", OffsetDateTime.now(), "status", "RECEIVED");
    }

    private Object value(Object value) {
        return value == null ? "" : value;
    }
}
