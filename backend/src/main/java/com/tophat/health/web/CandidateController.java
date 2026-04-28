package com.tophat.health.web;

import com.tophat.health.common.ApiEnvelope;
import com.tophat.health.common.CustomUserDetails;
import com.tophat.health.service.CandidatePortalService;
import jakarta.validation.constraints.NotBlank;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/candidates/me")
public class CandidateController {

    private final CandidatePortalService candidatePortalService;

    public CandidateController(CandidatePortalService candidatePortalService) {
        this.candidatePortalService = candidatePortalService;
    }

    @GetMapping
    public ApiEnvelope<Map<String, Object>> me(@AuthenticationPrincipal CustomUserDetails userDetails) {
        return ApiEnvelope.of(candidatePortalService.getMe(userDetails.getCandidateId()));
    }

    @PutMapping("/profile")
    public ApiEnvelope<Map<String, Object>> updateProfile(@AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestBody Map<String, Object> request) {
        return ApiEnvelope.of(candidatePortalService.updateProfile(userDetails.getCandidateId(), request));
    }

    @PostMapping("/availability")
    public ApiEnvelope<Map<String, Object>> addAvailability(@AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestBody AvailabilityRequest request) {
        return ApiEnvelope.of(candidatePortalService.addAvailability(userDetails.getCandidateId(), request.availableFrom(), request.availabilityType(), request.notes()));
    }

    @GetMapping("/compliance")
    public ApiEnvelope<Map<String, Object>> compliance(@AuthenticationPrincipal CustomUserDetails userDetails) {
        return ApiEnvelope.of(candidatePortalService.complianceDashboard(userDetails.getCandidateId()));
    }

    @PostMapping(value = "/documents", consumes = "multipart/form-data")
    public ApiEnvelope<Map<String, Object>> upload(@AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestParam("requirementId") String requirementId,
            @RequestParam(value = "expiryDate", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate expiryDate,
            @RequestPart("file") MultipartFile file) {
        return ApiEnvelope.of(candidatePortalService.uploadDocument(userDetails.getCandidateId(), java.util.UUID.fromString(requirementId), expiryDate, file));
    }

    @GetMapping("/placements")
    public ApiEnvelope<List<Map<String, Object>>> placements(@AuthenticationPrincipal CustomUserDetails userDetails) {
        return ApiEnvelope.of(candidatePortalService.placements(userDetails.getCandidateId()));
    }

    @GetMapping("/timesheets")
    public ApiEnvelope<List<Map<String, Object>>> timesheets(@AuthenticationPrincipal CustomUserDetails userDetails) {
        return ApiEnvelope.of(candidatePortalService.timesheets(userDetails.getCandidateId()));
    }

    @PostMapping("/timesheets")
    public ApiEnvelope<Map<String, Object>> submitTimesheet(@AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestBody TimesheetRequest request) {
        return ApiEnvelope.of(candidatePortalService.submitTimesheet(userDetails.getCandidateId(), request.placementId(), request.weekCommencing(), request.lines()));
    }

    @GetMapping("/messages")
    public ApiEnvelope<List<Map<String, Object>>> messages() {
        return ApiEnvelope.of(candidatePortalService.messages());
    }

    record AvailabilityRequest(LocalDate availableFrom, @NotBlank String availabilityType, String notes) {
    }

    record TimesheetRequest(java.util.UUID placementId, LocalDate weekCommencing, List<Map<String, Object>> lines) {
    }
}
