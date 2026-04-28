package com.tophat.health.repository;

import com.tophat.health.domain.ClientSite;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ClientSiteRepository extends JpaRepository<ClientSite, UUID> {
    List<ClientSite> findByClientId(UUID clientId);
}
