insert into clients (id, client_code, name, status)
values ('00000000-0000-0000-0000-000000000301', 'THH-TRUST-01', 'North West NHS Trust', 'ACTIVE');
insert into client_sites (id, client_id, site_name, address_line_1, city, postcode, active)
values ('00000000-0000-0000-0000-000000000302', '00000000-0000-0000-0000-000000000301', 'North West General Hospital',
        '1 Hospital Way', 'Manchester', 'M1 2AB', true);
insert into candidates (id, candidate_number, first_name, last_name, email, phone, date_of_birth, status)
values ('00000000-0000-0000-0000-000000000201', 'CAND-1001', 'Amara', 'Jones', 'amara.jones@example.com', '07123456789',
        '1992-07-14', 'ACTIVE');
insert into candidate_profiles (candidate_id, summary, primary_discipline, band, years_experience, current_location,
                                preferred_radius_miles, availability_status, availability_notes, available_from)
values ('00000000-0000-0000-0000-000000000201', 'Experienced RMN with prison and acute ward background.',
        'Mental Health Nursing', 'Band 6', 7, 'Manchester', 30, 'AVAILABLE', 'Can start short notice locum work.',
        current_date + interval '7 days');
insert into candidate_availability (id, candidate_id, available_from, availability_type, notes)
values ('00000000-0000-0000-0000-000000000211', '00000000-0000-0000-0000-000000000201',
        current_date + interval '7 days', 'LOCUM', 'Prefers night shifts and prison nursing roles.');
insert into compliance_requirements (id, code, name, specialism_scope, mandatory, validity_days)
values ('00000000-0000-0000-0000-000000000401', 'DBS', 'Enhanced DBS', 'NURSING', true, 365),
       ('00000000-0000-0000-0000-000000000402', 'RTW', 'Right to Work', 'ALL', true, 730),
       ('00000000-0000-0000-0000-000000000403', 'NMC', 'NMC Registration', 'NURSING', true, 365);
insert into job_postings (id, client_id, site_id, title, discipline, band, employment_type, description, location_text,
                          pay_rate_min, pay_rate_max, vacancy_status, published_at, closes_at)
values ('00000000-0000-0000-0000-000000000101', '00000000-0000-0000-0000-000000000301',
        '00000000-0000-0000-0000-000000000302', 'Band 6 RMN - Prison Nurse', 'Mental Health Nursing', 'Band 6', 'LOCUM',
        'Support prison mental health services with assessment, care planning, and crisis support.', 'Manchester',
        28.50, 34.00, 'PUBLISHED', now(), now() + interval '30 days'),
       ('00000000-0000-0000-0000-000000000102', '00000000-0000-0000-0000-000000000301',
        '00000000-0000-0000-0000-000000000302', 'Band 5 General Nurse - Acute Ward', 'General Nursing', 'Band 5',
        'TEMP', 'Deliver acute ward care, medication rounds, handovers, and patient support.', 'Manchester', 23.00,
        27.50, 'PUBLISHED', now(), now() + interval '21 days'),
       ('00000000-0000-0000-0000-000000000103', '00000000-0000-0000-0000-000000000301',
        '00000000-0000-0000-0000-000000000302', 'Band 7 Sonographer', 'Allied Health', 'Band 7', 'PERM',
        'Lead ultrasound sessions and support service quality initiatives.', 'Liverpool', 35.00, 42.00, 'PUBLISHED',
        now(), now() + interval '45 days');
insert into candidate_documents (id, candidate_id, requirement_id, document_type, file_key, original_filename,
                                 mime_type, expiry_date, scan_status, verification_status, review_notes, reviewed_at)
values ('00000000-0000-0000-0000-000000000501', '00000000-0000-0000-0000-000000000201',
        '00000000-0000-0000-0000-000000000401', 'DBS_CERTIFICATE', 'seed/dbs.pdf', 'dbs-certificate.pdf',
        'application/pdf', current_date + interval '180 days', 'CLEAN', 'APPROVED', 'Verified by compliance team.',
        now()),
       ('00000000-0000-0000-0000-000000000502', '00000000-0000-0000-0000-000000000201',
        '00000000-0000-0000-0000-000000000403', 'NMC_REGISTRATION', 'seed/nmc.pdf', 'nmc-registration.pdf',
        'application/pdf', current_date + interval '90 days', 'CLEAN', 'PENDING', 'Awaiting review.', null);
insert into placements (id, candidate_id, job_posting_id, client_id, site_id, consultant_name, start_date, end_date,
                        placement_status, pay_rate, charge_rate)
values ('00000000-0000-0000-0000-000000000601', '00000000-0000-0000-0000-000000000201',
        '00000000-0000-0000-0000-000000000101', '00000000-0000-0000-0000-000000000301',
        '00000000-0000-0000-0000-000000000302', 'Sophie Recruiter', current_date - interval '7 days',
        current_date + interval '30 days', 'ACTIVE', 31.50, 49.00);
insert into timesheets (id, placement_id, week_commencing, submission_status, submitted_at, total_hours,
                        approval_comment)
values ('00000000-0000-0000-0000-000000000701', '00000000-0000-0000-0000-000000000601',
        current_date - interval '7 days', 'PENDING_APPROVAL', now() - interval '1 day', 36.50,
        'Waiting for client approval');
insert into timesheet_lines (id, timesheet_id, shift_date, start_time, end_time, break_minutes, hours_worked)
values ('00000000-0000-0000-0000-000000000711', '00000000-0000-0000-0000-000000000701',
        current_date - interval '6 days', '08:00', '20:00', 60, 11.00),
       ('00000000-0000-0000-0000-000000000712', '00000000-0000-0000-0000-000000000701',
        current_date - interval '4 days', '08:00', '20:30', 60, 11.50),
       ('00000000-0000-0000-0000-000000000713', '00000000-0000-0000-0000-000000000701',
        current_date - interval '2 days', '09:00', '23:00', 60, 14.00);
insert into vacancy_requests (id, client_id, site_id, title, discipline, band, shift_pattern, notes, vacancy_status)
values ('00000000-0000-0000-0000-000000000801', '00000000-0000-0000-0000-000000000301',
        '00000000-0000-0000-0000-000000000302', 'Band 5 Night Nurse', 'General Nursing', 'Band 5', 'Nights',
        'Urgent 8-week vacancy for acute ward cover.', 'OPEN');
