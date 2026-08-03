---
title: "Sprint 69 - Security Hardening Runtime"
subtitle: "Added"
document_type: "Sprint documentation"
audience:
  - Business leaders
  - Platform administrators
  - Buyers and evaluators
  - Partners and technical stakeholders
status: "Publication edition"
published: "2026-08-03"
source_of_truth: "ServicePro repository"
---

# Sprint 69 - Security Hardening Runtime

> **Sprint documentation**
> Added

## Document Control

| Field | Detail |
|---|---|
| Purpose | Enterprise platform overview and buyer evaluation reference |
| Audience | Business leaders, platform administrators, evaluators, partners, and technical stakeholders |
| Scope | Capabilities, architecture, security, deployment, adoption, outcomes, and terminology |
| Source | ServicePro repository documentation; technical meaning preserved |

> [!NOTE]
> This publication edition improves navigation, document metadata, and cross-format consistency. Product and technical claims remain those of the source document.

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
