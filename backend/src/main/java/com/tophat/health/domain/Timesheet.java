package com.tophat.health.domain;

import com.tophat.health.domain.enums.TimesheetStatus;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "timesheets")
@Getter
@Setter
public class Timesheet {
    @Id
    private UUID id;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "placement_id", nullable = false)
    private Placement placement;
    @Column(name = "week_commencing", nullable = false)
    private LocalDate weekCommencing;
    @Enumerated(EnumType.STRING)
    @Column(name = "submission_status", nullable = false)
    private TimesheetStatus submissionStatus;
    @Column(name = "submitted_at")
    private OffsetDateTime submittedAt;
    @Column(name = "approved_at")
    private OffsetDateTime approvedAt;
    @Column(name = "rejected_at")
    private OffsetDateTime rejectedAt;
    @Column(name = "approval_comment", columnDefinition = "text")
    private String approvalComment;
    @Column(name = "locked_for_payroll")
    private boolean lockedForPayroll;
    @Column(name = "total_hours")
    private BigDecimal totalHours;
    @OneToMany(mappedBy = "timesheet", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<TimesheetLine> lines = new ArrayList<>();
}
