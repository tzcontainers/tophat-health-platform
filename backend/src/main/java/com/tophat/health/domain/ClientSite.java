package com.tophat.health.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Entity
@Table(name = "client_sites")
@Getter
@Setter
public class ClientSite {
    @Id
    private UUID id;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "client_id", nullable = false)
    private Client client;
    @Column(name = "site_name", nullable = false)
    private String siteName;
    @Column(name = "address_line_1")
    private String addressLine1;
    private String city;
    private String postcode;
    private boolean active;
}
