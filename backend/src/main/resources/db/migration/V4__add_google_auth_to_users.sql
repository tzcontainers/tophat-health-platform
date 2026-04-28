alter table users
    add column auth_provider varchar(50) not null default 'LOCAL',
    add column google_subject varchar(255) unique,
    add column email_verified boolean not null default false;

update users
set email_verified = true
where username is not null;
