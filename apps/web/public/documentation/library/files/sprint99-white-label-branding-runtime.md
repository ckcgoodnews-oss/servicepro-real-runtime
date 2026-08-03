---
title: "Sprint 99 - White-Label Branding Runtime"
subtitle: "Endpoints to wire"
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

# Sprint 99 - White-Label Branding Runtime

> **Sprint documentation**
> Endpoints to wire

## Document Control

| Field | Detail |
|---|---|
| Purpose | Enterprise platform overview and buyer evaluation reference |
| Audience | Business leaders, platform administrators, evaluators, partners, and technical stakeholders |
| Scope | Capabilities, architecture, security, deployment, adoption, outcomes, and terminology |
| Source | ServicePro repository documentation; technical meaning preserved |

> [!NOTE]
> This publication edition improves navigation, document metadata, and cross-format consistency. Product and technical claims remain those of the source document.

Apply this patch over Sprint 98.

## Endpoints to wire

```text
GET   /api/v1/branding/brands
POST  /api/v1/branding/brands
GET   /api/v1/branding/brands/:id
PATCH /api/v1/branding/brands/:id

GET  /api/v1/branding/brands/:id/assets
POST /api/v1/branding/brands/:id/assets

GET  /api/v1/branding/brands/:id/domains
POST /api/v1/branding/brands/:id/domains
POST /api/v1/branding/domains/:id/verify

GET /api/v1/branding/brands/:id/resolve
GET /api/v1/branding/brands/:id/theme.css
```

## Seed

```powershell
npm run seed:branding
```
