package com.tophat.health.domain;

import com.tophat.health.domain.enums.VacancyRequestStatus;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "vacancy_requests")
@Getter
@Setter
public class VacancyRequest {
    @Id
    private UUID id;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "client_id", nullable = false)
    private Client client;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "site_id")
    private ClientSite site;
    @Column(nullable = false)
    private String title;
    @Column(nullable = false)
    private String discipline;
    private String band;
    @Column(name = "shift_pattern")
    private String shiftPattern;
    @Column(columnDefinition = "text")
    private String notes;
    @Enumerated(EnumType.STRING)
    @Column(name = "vacancy_status", nullable = false)
    private VacancyRequestStatus vacancyStatus;
    @Column(name = "created_at", insertable = false, updatable = false)
    private OffsetDateTime createdAt;
}
