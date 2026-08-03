---
title: "Sprint 101 - Tenant Security Policy Runtime"
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

# Sprint 101 - Tenant Security Policy Runtime

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

Apply this patch over Sprint 100.

## Endpoints to wire

```text
GET   /api/v1/tenant-security/policies
POST  /api/v1/tenant-security/policies
GET   /api/v1/tenant-security/policies/:id
PATCH /api/v1/tenant-security/policies/:id

POST /api/v1/tenant-security/evaluate
GET  /api/v1/tenant-security/decisions
GET  /api/v1/tenant-security/summary
```

## Seed

```powershell
npm run seed:tenant-security
```
