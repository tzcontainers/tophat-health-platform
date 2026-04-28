package com.tophat.health.domain;

import com.tophat.health.domain.enums.JobStatus;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "job_postings")
@Getter
@Setter
public class JobPosting {
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
    @Column(name = "employment_type", nullable = false)
    private String employmentType;
    @Column(nullable = false, columnDefinition = "text")
    private String description;
    @Column(name = "location_text")
    private String locationText;
    @Column(name = "pay_rate_min")
    private BigDecimal payRateMin;
    @Column(name = "pay_rate_max")
    private BigDecimal payRateMax;
    @Enumerated(EnumType.STRING)
    @Column(name = "vacancy_status", nullable = false)
    private JobStatus vacancyStatus;
    @Column(name = "published_at")
    private OffsetDateTime publishedAt;
    @Column(name = "closes_at")
    private OffsetDateTime closesAt;
    @Column(name = "created_at", insertable = false, updatable = false)
    private OffsetDateTime createdAt;
    @Column(name = "updated_at", insertable = false, updatable = false)
    private OffsetDateTime updatedAt;
}
