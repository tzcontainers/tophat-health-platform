create table users
(
    id           uuid primary key,
    username     varchar(255) not null unique,
    password     varchar(255) not null,
    role         varchar(50)  not null,
    candidate_id uuid references candidates (id),
    client_id    uuid references clients (id),
    created_at   timestamptz  not null default now(),
    updated_at   timestamptz  not null default now()
);

-- Passwords are 'password' BCrypt hashed: $2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.TVuHOn2
insert into users (id, username, password, role, candidate_id)
values ('00000000-0000-0000-0000-000000000901', 'amara.jones@example.com', '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.TVuHOn2', 'CANDIDATE', '00000000-0000-0000-0000-000000000201');

insert into users (id, username, password, role, client_id)
values ('00000000-0000-0000-0000-000000000902', 'admin@nhs-trust.com', '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.TVuHOn2', 'CLIENT_ADMIN', '00000000-0000-0000-0000-000000000301');

insert into users (id, username, password, role)
values ('00000000-0000-0000-0000-000000000903', 'admin@tophat.com', '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.TVuHOn2', 'ADMIN');
