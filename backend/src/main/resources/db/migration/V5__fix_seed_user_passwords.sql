update users
set password = '$2a$10$CWfsqksgIUa39JW7ghPPLOQ57bPopjJfhJxFooCFTtxSa9Wp9.z9S'
where username in ('amara.jones@example.com', 'admin@nhs-trust.com', 'admin@tophat.com')
  and password = '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.TVuHOn2';
