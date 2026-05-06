package com.tophat.health.web;

import com.tophat.health.common.ApiEnvelope;
import com.tophat.health.domain.enums.JobStatus;
import com.tophat.health.service.AdminService;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/admin")
public class AdminController {

    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    @GetMapping("/candidates")
    public ApiEnvelope<List<Map<String, Object>>> candidates() {
        return ApiEnvelope.of(adminService.candidates());
    }

    @GetMapping("/candidates/{candidateId}")
    public ApiEnvelope<Map<String, Object>> candidate(@PathVariable UUID candidateId) {
        return ApiEnvelope.of(adminService.candidate(candidateId));
    }

    @GetMapping("/jobs")
    public ApiEnvelope<Map<String, Object>> jobs(@RequestParam(required = false) String search,
            @RequestParam(required = false) String discipline,
            @RequestParam(required = false) String band,
            @RequestParam(required = false) String employmentType,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) BigDecimal minPay,
            @RequestParam(required = false) BigDecimal maxPay,
            @RequestParam(required = false) JobStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ApiEnvelope.of(adminService.jobs(search, discipline, band, employmentType, location, minPay, maxPay, status, page, size));
    }

    @PostMapping("/jobs")
    public ApiEnvelope<Map<String, Object>> createJob(@RequestBody Map<String, Object> payload) {
        return ApiEnvelope.of(adminService.createJob(payload));
    }

    @PatchMapping("/jobs/{jobId}")
    public ApiEnvelope<Map<String, Object>> updateJob(@PathVariable UUID jobId, @RequestBody Map<String, Object> payload) {
        return ApiEnvelope.of(adminService.updateJob(jobId, payload));
    }

    @PostMapping("/placements")
    public ApiEnvelope<Map<String, Object>> createPlacement(@RequestBody Map<String, Object> payload) {
        return ApiEnvelope.of(adminService.createPlacement(payload));
    }

    @PostMapping("/compliance/reviews")
    public ApiEnvelope<Map<String, Object>> reviewCompliance(@RequestBody Map<String, String> payload) {
        return ApiEnvelope.of(adminService.reviewCompliance(UUID.fromString(payload.get("documentId")), payload.get("status"), payload.getOrDefault("notes", "")));
    }

    @GetMapping("/timesheets")
    public ApiEnvelope<List<Map<String, Object>>> timesheets() {
        return ApiEnvelope.of(adminService.timesheets());
    }

    @GetMapping("/reports/compliance")
    public ApiEnvelope<List<Map<String, Object>>> complianceReport() {
        return ApiEnvelope.of(adminService.complianceReport());
    }

    @GetMapping("/clients")
    public ApiEnvelope<List<Map<String, Object>>> clients() {
        return ApiEnvelope.of(adminService.clients());
    }

    @GetMapping("/clients/{clientId}/sites")
    public ApiEnvelope<List<Map<String, Object>>> clientSites(@PathVariable UUID clientId) {
        return ApiEnvelope.of(adminService.clientSites(clientId));
    }

    @GetMapping("/users")
    public ApiEnvelope<List<Map<String, Object>>> users() {
        return ApiEnvelope.of(adminService.users());
    }

    @PostMapping("/users")
    public ApiEnvelope<Map<String, Object>> createUser(@RequestBody Map<String, String> payload) {
        return ApiEnvelope.of(adminService.createUser(payload.get("username"), payload.get("password"), payload.getOrDefault("role", "CANDIDATE")));
    }

    @PatchMapping("/users/{userId}/role")
    public ApiEnvelope<Map<String, Object>> updateUserRole(@PathVariable UUID userId, @RequestBody Map<String, String> payload) {
        return ApiEnvelope.of(adminService.updateUserRole(userId, payload.get("role")));
    }

    @PatchMapping("/users/{userId}/preferences")
    public ApiEnvelope<Map<String, Object>> updateUserPreferences(@PathVariable UUID userId, @RequestBody Map<String, Object> payload) {
        return ApiEnvelope.of(adminService.updateUserPreferences(userId, payload));
    }

    @PostMapping("/users/{userId}/make-admin")
    public ApiEnvelope<Map<String, Object>> makeAdmin(@PathVariable UUID userId) {
        return ApiEnvelope.of(adminService.assignAdmin(userId));
    }

    @DeleteMapping("/users/{userId}")
    public ApiEnvelope<Map<String, Object>> deleteUser(@PathVariable UUID userId) {
        return ApiEnvelope.of(adminService.deleteUser(userId));
    }

    @GetMapping("/teams")
    public ApiEnvelope<List<Map<String, Object>>> getTeams() {
        return ApiEnvelope.of(adminService.getTeams());
    }

    @PostMapping("/teams")
    public ApiEnvelope<Map<String, Object>> createTeam(@RequestBody Map<String, String> payload) {
        return ApiEnvelope.of(adminService.createTeam(payload.get("name"), payload.get("description")));
    }

    @DeleteMapping("/teams/{teamId}")
    public ApiEnvelope<Void> deleteTeam(@PathVariable UUID teamId) {
        adminService.deleteTeam(teamId);
        return ApiEnvelope.of(null);
    }

    @GetMapping("/teams/{teamId}/members")
    public ApiEnvelope<List<Map<String, Object>>> getTeamMembers(@PathVariable UUID teamId) {
        return ApiEnvelope.of(adminService.getTeamMembers(teamId));
    }

    @PostMapping("/teams/{teamId}/members")
    public ApiEnvelope<Map<String, Object>> addTeamMember(@PathVariable UUID teamId, @RequestBody Map<String, String> payload) {
        return ApiEnvelope.of(adminService.addTeamMember(teamId, UUID.fromString(payload.get("userId")), payload.get("role")));
    }

    @DeleteMapping("/teams/members/{memberId}")
    public ApiEnvelope<Void> removeTeamMember(@PathVariable UUID memberId) {
        adminService.removeTeamMember(memberId);
        return ApiEnvelope.of(null);
    }

    @PostMapping("/notifications/send")
    public ApiEnvelope<Map<String, Object>> sendNotification(@RequestBody Map<String, String> payload) {
        return ApiEnvelope.of(adminService.sendNotification(payload.getOrDefault("audience", "ALL"), payload.getOrDefault("subject", "TopHat Notification"), payload.getOrDefault("body", "")));
    }
}
