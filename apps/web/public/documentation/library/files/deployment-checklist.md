---
title: "Deployment Checklist"
subtitle: "Before build"
document_type: "Operations and reference"
audience:
  - Business leaders
  - Platform administrators
  - Buyers and evaluators
  - Partners and technical stakeholders
status: "Publication edition"
published: "2026-08-03"
source_of_truth: "ServicePro repository"
---

# Deployment Checklist

> **Operations and reference**
> Before build

## Document Control

| Field | Detail |
|---|---|
| Purpose | Enterprise platform overview and buyer evaluation reference |
| Audience | Business leaders, platform administrators, evaluators, partners, and technical stakeholders |
| Scope | Capabilities, architecture, security, deployment, adoption, outcomes, and terminology |
| Source | ServicePro repository documentation; technical meaning preserved |

> [!NOTE]
> This publication edition improves navigation, document metadata, and cross-format consistency. Product and technical claims remain those of the source document.

## Before build

- Confirm `.env.production` exists in the deployment environment.
- Confirm `JWT_SECRET` and `PORTAL_TOKEN_SECRET` are unique and long.
- Confirm `DATABASE_URL` points to the production PostgreSQL database.
- Confirm `CORS_ALLOWED_ORIGINS` contains only trusted domains.
- Confirm `DATA_STORE=postgres`.

## Build

```powershell
docker build -t servicepro-api:8.0.0-alpha.1 .
```

## Run database migrations

```powershell
npm run migrate
```

## Smoke checks

```powershell
npm run config:check
npm run deploy:check
```

## Rollback

- Re-deploy the previous container tag.
- Restore database from latest verified backup if a migration rollback is required.
