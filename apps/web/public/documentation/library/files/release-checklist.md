---
title: "Release Checklist"
subtitle: "Before tagging"
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

# Release Checklist

> **Operations and reference**
> Before tagging

## Document Control

| Field | Detail |
|---|---|
| Purpose | Enterprise platform overview and buyer evaluation reference |
| Audience | Business leaders, platform administrators, evaluators, partners, and technical stakeholders |
| Scope | Capabilities, architecture, security, deployment, adoption, outcomes, and terminology |
| Source | ServicePro repository documentation; technical meaning preserved |

> [!NOTE]
> This publication edition improves navigation, document metadata, and cross-format consistency. Product and technical claims remain those of the source document.

## Before tagging

```powershell
npm install
npm run migrations:check
npm test
npm run config:check
docker build -t servicepro-api:<version> .
```

## Tag

```powershell
git tag v0.72.0
git push origin v0.72.0
```

## Deployment

```powershell
docker compose up -d --build
docker compose exec api npm run migrate
docker compose exec api npm run seed:services
```

## Post-deployment checks

```powershell
Invoke-RestMethod https://your-domain/healthz
Invoke-RestMethod https://your-domain/readyz
```

## Rollback

- Re-deploy the previous image tag.
- Restore database backup only if the release included destructive migration behavior.
- Preserve logs and audit events for diagnosis.
