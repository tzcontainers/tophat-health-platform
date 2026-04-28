package com.tophat.health.repository;

import com.tophat.health.domain.ContactRequest;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface ContactRequestRepository extends JpaRepository<ContactRequest, UUID> {
}
