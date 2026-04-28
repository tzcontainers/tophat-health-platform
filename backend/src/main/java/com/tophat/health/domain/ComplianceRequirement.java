package com.tophat.health.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Entity
@Table(name = "compliance_requirements")
@Getter
@Setter
public class ComplianceRequirement {
    @Id
    private UUID id;
    @Column(nullable = false, unique = true)
    private String code;
    @Column(nullable = false)
    private String name;
    @Column(name = "specialism_scope")
    private String specialismScope;
    @Column(nullable = false)
    private boolean mandatory;
    @Column(name = "validity_days")
    private Integer validityDays;
}
