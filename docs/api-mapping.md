API mappings for this healthcare app should stay as internal engineering documentation rather than being rendered in the public-facing frontend.

Use these code locations when tracing route-to-API-to-database behaviour:

- `frontend/app` for user-facing routes
- `frontend/lib/api.ts` for frontend HTTP helpers
- `backend/src/main/java/com/tophat/health/web` for controller endpoints
- `backend/src/main/java/com/tophat/health/service` for business logic
- `backend/src/main/resources/db/migration/V1__init_schema.sql` for schema relationships
