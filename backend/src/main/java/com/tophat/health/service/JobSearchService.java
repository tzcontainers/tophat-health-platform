package com.tophat.health.service;

import com.tophat.health.domain.Client;
import com.tophat.health.domain.ClientSite;
import com.tophat.health.domain.JobPosting;
import com.tophat.health.repository.JobPostingRepository;
import jakarta.persistence.criteria.Expression;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@Transactional(readOnly = true)
public class JobSearchService {

    private final JobPostingRepository jobPostingRepository;

    public JobSearchService(JobPostingRepository jobPostingRepository) {
        this.jobPostingRepository = jobPostingRepository;
    }

    public Map<String, Object> search(JobSearchCriteria criteria) {
        int pageNumber = Math.max(0, criteria.page());
        int pageSize = Math.min(50, Math.max(1, criteria.size()));
        PageRequest pageRequest = PageRequest.of(pageNumber, pageSize,
                Sort.by(Sort.Order.desc("publishedAt"), Sort.Order.desc("createdAt")));

        Page<JobPosting> page = jobPostingRepository.findAll(specification(criteria), pageRequest);

        Map<String, Object> response = new HashMap<>();
        response.put("items", page.getContent()
                .stream()
                .map(this::toJobSummary)
                .toList());
        response.put("page", page.getNumber());
        response.put("size", page.getSize());
        response.put("totalItems", page.getTotalElements());
        response.put("totalPages", page.getTotalPages());
        response.put("hasNext", page.hasNext());
        response.put("hasPrevious", page.hasPrevious());
        return response;
    }

    private Specification<JobPosting> specification(JobSearchCriteria criteria) {
        return (root, query, builder) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (criteria.status() != null) {
                predicates.add(builder.equal(root.get("vacancyStatus"), criteria.status()));
            }
            if (criteria.clientId() != null) {
                predicates.add(builder.equal(root.get("client")
                        .get("id"), criteria.clientId()));
            }

            Join<JobPosting, Client> client = root.join("client", JoinType.LEFT);
            Join<JobPosting, ClientSite> site = root.join("site", JoinType.LEFT);

            if (hasText(criteria.search())) {
                String term = likeTerm(criteria.search());
                predicates.add(builder.or(
                        contains(builder, root.get("title"), term),
                        contains(builder, root.get("description"), term),
                        contains(builder, root.get("discipline"), term),
                        contains(builder, root.get("band"), term),
                        contains(builder, root.get("employmentType"), term),
                        contains(builder, root.get("locationText"), term),
                        contains(builder, client.get("name"), term),
                        contains(builder, site.get("siteName"), term),
                        contains(builder, site.get("city"), term),
                        contains(builder, site.get("postcode"), term)
                ));
            }
            if (hasText(criteria.discipline())) {
                predicates.add(contains(builder, root.get("discipline"), likeTerm(criteria.discipline())));
            }
            if (hasText(criteria.band())) {
                predicates.add(contains(builder, root.get("band"), likeTerm(criteria.band())));
            }
            if (hasText(criteria.employmentType())) {
                predicates.add(contains(builder, root.get("employmentType"), likeTerm(criteria.employmentType())));
            }
            if (hasText(criteria.location())) {
                String term = likeTerm(criteria.location());
                predicates.add(builder.or(
                        contains(builder, root.get("locationText"), term),
                        contains(builder, site.get("siteName"), term),
                        contains(builder, site.get("city"), term),
                        contains(builder, site.get("postcode"), term)
                ));
            }
            if (criteria.minPay() != null) {
                predicates.add(builder.greaterThanOrEqualTo(root.get("payRateMax"), criteria.minPay()));
            }
            if (criteria.maxPay() != null) {
                predicates.add(builder.lessThanOrEqualTo(root.get("payRateMin"), criteria.maxPay()));
            }

            return builder.and(predicates.toArray(Predicate[]::new));
        };
    }

    private Predicate contains(jakarta.persistence.criteria.CriteriaBuilder builder, Expression<String> field, String term) {
        return builder.like(builder.lower(builder.coalesce(field, "")), term);
    }

    private String likeTerm(String value) {
        return "%" + value.trim()
                .toLowerCase() + "%";
    }

    private boolean hasText(String value) {
        return value != null && !value.isBlank();
    }

    private Object value(Object value) {
        return value == null ? "" : value;
    }

    private Map<String, Object> toJobSummary(JobPosting job) {
        return Map.ofEntries(
                Map.entry("id", job.getId()),
                Map.entry("title", job.getTitle()),
                Map.entry("discipline", job.getDiscipline()),
                Map.entry("band", value(job.getBand())),
                Map.entry("employmentType", job.getEmploymentType()),
                Map.entry("location", value(job.getLocationText())),
                Map.entry("payRateMin", value(job.getPayRateMin())),
                Map.entry("payRateMax", value(job.getPayRateMax())),
                Map.entry("status", job.getVacancyStatus()),
                Map.entry("clientName", job.getClient()
                        .getName()),
                Map.entry("siteName", value(job.getSite() != null ? job.getSite()
                        .getSiteName() : null)),
                Map.entry("publishedAt", value(job.getPublishedAt())),
                Map.entry("closesAt", value(job.getClosesAt()))
        );
    }
}
