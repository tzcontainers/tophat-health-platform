package com.tophat.health.web;

import com.tophat.health.common.ApiEnvelope;
import com.tophat.health.common.CustomUserDetails;
import com.tophat.health.service.ClientPortalService;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/client")
public class ClientController {

    private final ClientPortalService clientPortalService;

    public ClientController(ClientPortalService clientPortalService) {
        this.clientPortalService = clientPortalService;
    }

    @GetMapping("/jobs")
    public ApiEnvelope<List<Map<String, Object>>> jobs(@AuthenticationPrincipal CustomUserDetails userDetails) {
        return ApiEnvelope.of(clientPortalService.jobs(userDetails.getClientId()));
    }

    @PostMapping("/vacancy-requests")
    public ApiEnvelope<Map<String, Object>> createVacancyRequest(@AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestBody Map<String, Object> request) {
        UUID siteId = request.get("siteId") == null || request.get("siteId")
                                                              .toString()
                                                              .isBlank() ? null : UUID.fromString(request.get("siteId")
                                                                                                         .toString());
        return ApiEnvelope.of(clientPortalService.createVacancyRequest(userDetails.getClientId(), siteId,
                request.get("title")
                       .toString(), request.get("discipline")
                                           .toString(),
                (String) request.getOrDefault("band", ""), (String) request.getOrDefault("shiftPattern", ""),
                (String) request.getOrDefault("notes", "")));
    }

    @GetMapping("/placements")
    public ApiEnvelope<List<Map<String, Object>>> placements(@AuthenticationPrincipal CustomUserDetails userDetails) {
        return ApiEnvelope.of(clientPortalService.placements(userDetails.getClientId()));
    }

    @GetMapping("/timesheets/pending")
    public ApiEnvelope<List<Map<String, Object>>> pendingTimesheets(@AuthenticationPrincipal CustomUserDetails userDetails) {
        return ApiEnvelope.of(clientPortalService.pendingTimesheets(userDetails.getClientId()));
    }

    @PostMapping("/timesheets/{timesheetId}/approve")
    public ApiEnvelope<Map<String, Object>> approve(@AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable UUID timesheetId,
            @RequestBody(required = false) Map<String, String> request) {
        return ApiEnvelope.of(clientPortalService.approve(userDetails.getClientId(), timesheetId, request == null ? null : request.get("comment")));
    }

    @PostMapping("/timesheets/{timesheetId}/reject")
    public ApiEnvelope<Map<String, Object>> reject(@AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable UUID timesheetId,
            @RequestBody(required = false) Map<String, String> request) {
        return ApiEnvelope.of(clientPortalService.reject(userDetails.getClientId(), timesheetId, request == null ? null : request.get("comment")));
    }
}
