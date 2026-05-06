update users
set role = 'CANDIDATE',
    candidate_id = '00000000-0000-0000-0000-000000000201',
    client_id = null
where username = 'amara.jones@example.com';

update users
set role = 'CLIENT_ADMIN',
    candidate_id = null,
    client_id = '00000000-0000-0000-0000-000000000301'
where username = 'admin@nhs-trust.com';

update users
set role = 'ADMIN',
    candidate_id = null,
    client_id = null
where username = 'admin@tophat.com';
