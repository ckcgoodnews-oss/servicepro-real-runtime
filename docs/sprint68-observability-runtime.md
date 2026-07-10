# Sprint 68 - Observability Runtime

Apply this patch over Sprint 67.

## Added

- Request IDs via `x-request-id`.
- Structured JSON logging.
- Request metrics.
- Enhanced health/readiness payloads.
- Observability endpoints.

## Endpoints

```text
GET /healthz
GET /readyz
GET /api/v1/observability/metrics
GET /api/v1/observability/summary
```
