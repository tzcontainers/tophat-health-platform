# TopHat Health Care Platform

A full-stack starter repository for a healthcare recruitment and staffing platform.

## What is included

- Java backend using a database-first approach with Flyway migrations
- Modern Next.js frontend for public, candidate, client, and admin journeys
- Docker Compose for local PostgreSQL, backend, and frontend
- Seed data for jobs, candidate compliance, placements, and timesheets
- Core APIs wired to the UI

## What this project is

This repository is a strong production-style starter and learning scaffold. It covers the core flows end-to-end:

- public jobs
- candidate registration
- candidate profile updates
- availability updates
- compliance upload and review status
- placements
- timesheets and client approval
- client vacancy requests
- admin job management
- admin compliance reporting and review
- admin placement creation
- admin notifications

## What is intentionally simplified

To keep local development approachable, a few enterprise concerns are simplified:

- authentication is simulated with development headers and seeded IDs
- document uploads are saved to the local filesystem, not cloud object storage
- notifications are acknowledged in the API instead of sending real email or SMS
- some dashboards are intentionally compact and starter-oriented

## Repository structure

```text
backend/   Spring Boot API + Flyway migrations + JPA data access
frontend/  Next.js App Router UI with modern portal pages
docs/      Notes and API mapping
```

## Quick start with Docker

```bash
docker compose up --build
```

Open:

- Frontend: http://localhost:3000
- Backend API: http://localhost:8080
- Swagger UI: http://localhost:8080/swagger-ui/index.html

## Running without Docker

### Backend

Requirements:

- Java 21
- Maven 3.9+
- PostgreSQL

Run:

```bash
cd backend
mvn spring-boot:run
```

### Frontend

Requirements:

- Node 22+

Run:

```bash
cd frontend
npm install
npm run dev
```

## Seeded development identities

The frontend automatically uses these seeded identifiers in local development:

- Candidate ID: `00000000-0000-0000-0000-000000000201`
- Client ID: `00000000-0000-0000-0000-000000000301`

The backend reads these headers when needed:

- `X-Candidate-Id`
- `X-Client-Id`
- `X-Role`

## Learning path through the code

### Backend

Start here:

1. `backend/src/main/resources/db/migration` for schema-first design
2. `domain` for core entities
3. `repository` for persistence
4. `service` for business logic
5. `web` for API controllers

### Frontend

Start here:

1. `frontend/app` for route groups and portal pages
2. `frontend/lib/api.ts` for backend communication
3. `frontend/components` for reusable UI pieces
4. page forms and tables for API wiring examples

## Notes

This project was created as a substantial scaffold in an offline build environment, so dependency installation and full
runtime validation were not executed inside this workspace. The source layout, wiring, and Docker setup are prepared so
you can pull dependencies and run it normally on a connected machine.
