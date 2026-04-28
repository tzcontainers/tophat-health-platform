package com.tophat.health.domain;

import com.tophat.health.domain.enums.DocumentStatus;
import com.tophat.health.domain.enums.ScanStatus;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "candidate_documents")
@Getter
@Setter
public class CandidateDocument {
    @Id
    private UUID id;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "candidate_id", nullable = false)
    private Candidate candidate;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "requirement_id", nullable = false)
    private ComplianceRequirement requirement;
    @Column(name = "document_type", nullable = false)
    private String documentType;
    @Column(name = "file_key", nullable = false)
    private String fileKey;
    @Column(name = "original_filename", nullable = false)
    private String originalFilename;
    @Column(name = "mime_type", nullable = false)
    private String mimeType;
    @Column(name = "uploaded_at", insertable = false, updatable = false)
    private OffsetDateTime uploadedAt;
    @Column(name = "expiry_date")
    private LocalDate expiryDate;
    @Enumerated(EnumType.STRING)
    @Column(name = "scan_status", nullable = false)
    private ScanStatus scanStatus;
    @Enumerated(EnumType.STRING)
    @Column(name = "verification_status", nullable = false)
    private DocumentStatus verificationStatus;
    @Column(name = "review_notes", columnDefinition = "text")
    private String reviewNotes;
    @Column(name = "reviewed_at")
    private OffsetDateTime reviewedAt;
}
