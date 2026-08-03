---
title: "Sprint 123 - Customer Trust Center"
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

# Sprint 123 - Customer Trust Center

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

Apply this patch over Sprint 122.

## Endpoints to wire

```text
GET  /api/v1/trust-center/profiles
POST /api/v1/trust-center/profiles
POST /api/v1/trust-center/profiles/:id/publish
GET  /api/v1/trust-center/documents
POST /api/v1/trust-center/documents
POST /api/v1/trust-center/documents/:id/publish
GET  /api/v1/trust-center/access-requests
POST /api/v1/trust-center/documents/:id/access-requests
POST /api/v1/trust-center/access-requests/:id/sign-nda
POST /api/v1/trust-center/access-requests/:id/approve
POST /api/v1/trust-center/access-requests/:id/reject
GET  /api/v1/trust-center/shares
POST /api/v1/trust-center/access-requests/:id/shares
POST /api/v1/trust-center/shares/:id/view
POST /api/v1/trust-center/shares/:id/revoke
GET  /api/v1/trust-center/audit
GET  /api/v1/trust-center/metrics
```

## Seed

```powershell
npm run seed:trust-center
```
