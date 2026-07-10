# Sprint 69 - Security Hardening Runtime

Apply this patch over Sprint 68.

## Added

- Security headers
- CORS allow-list
- Payload size limits
- In-process rate limiting
- Security event repository
- Security visibility routes

## Endpoints

```text
GET /api/v1/security/events
GET /api/v1/security/rate-limits
```

## Environment

```text
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
MAX_JSON_BODY_BYTES=1048576
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=120
AUTH_RATE_LIMIT_MAX_REQUESTS=12
```
