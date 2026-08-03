---
title: "Sprint 71 - Deployment Runtime"
subtitle: "Local Docker deployment"
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

# Sprint 71 - Deployment Runtime

> **Sprint documentation**
> Local Docker deployment

## Document Control

| Field | Detail |
|---|---|
| Purpose | Enterprise platform overview and buyer evaluation reference |
| Audience | Business leaders, platform administrators, evaluators, partners, and technical stakeholders |
| Scope | Capabilities, architecture, security, deployment, adoption, outcomes, and terminology |
| Source | ServicePro repository documentation; technical meaning preserved |

> [!NOTE]
> This publication edition improves navigation, document metadata, and cross-format consistency. Product and technical claims remain those of the source document.

Apply this patch over Sprint 70.

## Local Docker deployment

```powershell
docker compose up -d --build
docker compose exec api npm run migrate
docker compose exec api npm run seed:auth
docker compose exec api npm run seed:services
```

Check the API:

```powershell
Invoke-RestMethod http://localhost:3000/healthz
Invoke-RestMethod http://localhost:3000/readyz
```

## Production configuration

Use `.env.production.example` as a starting point.

Required production settings:

```text
NODE_ENV=production
DATA_STORE=postgres
DATABASE_URL=...
JWT_SECRET=64+ random characters recommended
PORTAL_TOKEN_SECRET=64+ random characters recommended
CORS_ALLOWED_ORIGINS=https://your-real-domain
```

## Pre-deployment validation

```powershell
npm run config:check
npm run migrate
npm test
```

## Container health

The Dockerfile includes a healthcheck that calls:

```text
node scripts/deployment-check.js
```
