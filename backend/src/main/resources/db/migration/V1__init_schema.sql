create table clients
(
    id          uuid primary key,
    client_code varchar(50)  not null unique,
    name        varchar(255) not null,
    status      varchar(30)  not null,
    created_at  timestamptz  not null default now(),
    updated_at  timestamptz  not null default now()
);
create table client_sites
(
    id             uuid primary key,
    client_id      uuid         not null references clients (id),
    site_name      varchar(255) not null,
    address_line_1 varchar(255),
    city           varchar(120),
    postcode       varchar(20),
    active         boolean      not null default true
);
create table candidates
(
    id               uuid primary key,
    candidate_number varchar(50)  not null unique,
    first_name       varchar(120) not null,
    last_name        varchar(120) not null,
    email            varchar(255) not null unique,
    phone            varchar(30),
    date_of_birth    date,
    status           varchar(30)  not null,
    created_at       timestamptz  not null default now(),
    updated_at       timestamptz  not null default now()
);
create table candidate_profiles
(
    candidate_id           uuid primary key references candidates (id),
    summary                text,
    primary_discipline     varchar(100),
    band                   varchar(50),
    years_experience       integer,
    current_location       varchar(120),
    preferred_radius_miles integer,
    availability_status    varchar(50),
    availability_notes     text,
    available_from         date
);
create table candidate_availability
(
    id                uuid primary key,
    candidate_id      uuid        not null references candidates (id),
    available_from    date        not null,
    availability_type varchar(50) not null,
    notes             text,
    created_at        timestamptz not null default now()
);
create table job_postings
(
    id              uuid primary key,
    client_id       uuid         not null references clients (id),
    site_id         uuid references client_sites (id),
    title           varchar(255) not null,
    discipline      varchar(100) not null,
    band            varchar(50),
    employment_type varchar(30)  not null,
    description     text         not null,
    location_text   varchar(255),
    pay_rate_min    numeric(10, 2),
    pay_rate_max    numeric(10, 2),
    vacancy_status  varchar(30)  not null,
    published_at    timestamptz,
    closes_at       timestamptz,
    created_at      timestamptz  not null default now(),
    updated_at      timestamptz  not null default now()
);
create table compliance_requirements
(
    id               uuid primary key,
    code             varchar(50)  not null unique,
    name             varchar(255) not null,
    specialism_scope varchar(100),
    mandatory        boolean      not null default true,
    validity_days    integer
);
create table candidate_documents
(
    id                  uuid primary key,
    candidate_id        uuid         not null references candidates (id),
    requirement_id      uuid         not null references compliance_requirements (id),
    document_type       varchar(100) not null,
    file_key            varchar(500) not null,
    original_filename   varchar(255) not null,
    mime_type           varchar(100) not null,
    uploaded_at         timestamptz  not null default now(),
    expiry_date         date,
    scan_status         varchar(30)  not null,
    verification_status varchar(30)  not null,
    review_notes        text,
    reviewed_at         timestamptz
);
create table placements
(
    id               uuid primary key,
    candidate_id     uuid           not null references candidates (id),
    job_posting_id   uuid           not null references job_postings (id),
    client_id        uuid           not null references clients (id),
    site_id          uuid references client_sites (id),
    consultant_name  varchar(120)   not null,
    start_date       date           not null,
    end_date         date,
    placement_status varchar(30)    not null,
    pay_rate         numeric(10, 2) not null,
    charge_rate      numeric(10, 2) not null,
    created_at       timestamptz    not null default now()
);
create table timesheets
(
    id                 uuid primary key,
    placement_id       uuid          not null references placements (id),
    week_commencing    date          not null,
    submission_status  varchar(30)   not null,
    submitted_at       timestamptz,
    approved_at        timestamptz,
    rejected_at        timestamptz,
    approval_comment   text,
    locked_for_payroll boolean       not null default false,
    total_hours        numeric(8, 2) not null default 0
);
create table timesheet_lines
(
    id            uuid primary key,
    timesheet_id  uuid          not null references timesheets (id) on delete cascade,
    shift_date    date          not null,
    start_time    time          not null,
    end_time      time          not null,
    break_minutes integer       not null default 0,
    hours_worked  numeric(6, 2) not null
);
create table vacancy_requests
(
    id             uuid primary key,
    client_id      uuid         not null references clients (id),
    site_id        uuid references client_sites (id),
    title          varchar(255) not null,
    discipline     varchar(100) not null,
    band           varchar(50),
    shift_pattern  varchar(100),
    notes          text,
    vacancy_status varchar(30)  not null,
    created_at     timestamptz  not null default now()
);
create table contact_requests
(
    id         uuid primary key,
    name       varchar(255) not null,
    email      varchar(255) not null,
    phone      varchar(30),
    message    text,
    created_at timestamptz  not null default now()
);
