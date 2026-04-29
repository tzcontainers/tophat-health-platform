package com.tophat.health.web;

import com.tophat.health.common.ApiEnvelope;
import com.tophat.health.service.PublicService;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/public")
@Validated
public class PublicController {

    private final PublicService publicService;

    public PublicController(PublicService publicService) {
        this.publicService = publicService;
    }

    @GetMapping("/jobs")
    public ApiEnvelope<Map<String, Object>> jobs(@RequestParam(required = false) String search,
            @RequestParam(required = false) String discipline,
            @RequestParam(required = false) String band,
            @RequestParam(required = false) String employmentType,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) BigDecimal minPay,
            @RequestParam(required = false) BigDecimal maxPay,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "9") int size) {
        return ApiEnvelope.of(publicService.listJobs(search, discipline, band, employmentType, location, minPay, maxPay, page, size));
    }

    @GetMapping("/jobs/{jobId}")
    public ApiEnvelope<Map<String, Object>> job(@PathVariable UUID jobId) {
        return ApiEnvelope.of(publicService.getJob(jobId));
    }

    @PostMapping("/candidates/register")
    public ApiEnvelope<Map<String, Object>> registerCandidate(@RequestBody RegisterCandidateRequest request) {
        return ApiEnvelope.of(publicService.registerCandidate(request.firstName(), request.lastName(), request.email(), request.password(), request.phone(), request.primaryDiscipline()));
    }

    @PostMapping("/clients/register")
    public ApiEnvelope<Map<String, Object>> registerClient(@RequestBody RegisterClientRequest request) {
        return ApiEnvelope.of(publicService.registerClient(request.name(), request.email(), request.password()));
    }

    @PostMapping("/contact-requests")
    public ApiEnvelope<Map<String, Object>> contact(@RequestBody ContactRequest request) {
        return ApiEnvelope.of(publicService.createContactRequest(request.name(), request.email(), request.phone(), request.message()));
    }

    record RegisterCandidateRequest(@NotBlank String firstName, @NotBlank String lastName, @Email String email, @NotBlank String password, String phone,
                           String primaryDiscipline) {
    }

    record RegisterClientRequest(@NotBlank String name, @Email String email, @NotBlank String password) {
    }

    record ContactRequest(@NotBlank String name, @Email String email, String phone, String message) {
    }
}
