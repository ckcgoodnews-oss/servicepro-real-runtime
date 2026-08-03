---
title: "Sprint 127 - Legal Hold and eDiscovery"
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

# Sprint 127 - Legal Hold and eDiscovery

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

Apply this patch over Sprint 126.

## Endpoints to wire

```text
GET  /api/v1/legal-hold/matters
POST /api/v1/legal-hold/matters
POST /api/v1/legal-hold/matters/:id/close
GET  /api/v1/legal-hold/holds
POST /api/v1/legal-hold/matters/:id/holds
POST /api/v1/legal-hold/holds/:id/issue
POST /api/v1/legal-hold/holds/:id/release
GET  /api/v1/legal-hold/holds/:id/custodians
POST /api/v1/legal-hold/holds/:id/custodians
POST /api/v1/legal-hold/custodians/:id/acknowledge
GET  /api/v1/legal-hold/holds/:id/scopes
POST /api/v1/legal-hold/holds/:id/scopes
POST /api/v1/legal-hold/scopes/:id/preserve
POST /api/v1/legal-hold/holds/:id/collections
POST /api/v1/legal-hold/collections/:id/start
POST /api/v1/legal-hold/collections/:id/complete
POST /api/v1/legal-hold/matters/:id/exports
POST /api/v1/legal-hold/exports/:id/start
POST /api/v1/legal-hold/exports/:id/complete
GET  /api/v1/legal-hold/metrics
```

## Seed

```powershell
npm run seed:legal-hold
```
