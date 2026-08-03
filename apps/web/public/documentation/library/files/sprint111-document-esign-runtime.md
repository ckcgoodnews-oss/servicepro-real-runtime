---
title: "Sprint 111 - Document and E-Signature Runtime"
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

# Sprint 111 - Document and E-Signature Runtime

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

Apply this patch over Sprint 110.

## Endpoints to wire

```text
GET  /api/v1/documents/templates
POST /api/v1/documents/templates
GET  /api/v1/documents/packets
POST /api/v1/documents/packets
POST /api/v1/documents/packets/:id/generate
GET  /api/v1/documents/packets/:id/approvals
POST /api/v1/documents/packets/:id/approvals
POST /api/v1/documents/approvals/:id/approve
POST /api/v1/documents/approvals/:id/reject
POST /api/v1/documents/packets/:id/signature-requests
POST /api/v1/documents/signature-requests/:id/send
GET  /api/v1/documents/signature-requests/:id/recipients
POST /api/v1/documents/signature-requests/:id/recipients
POST /api/v1/documents/signature-recipients/:id/sign
POST /api/v1/documents/signature-recipients/:id/decline
GET  /api/v1/documents/packets/:id/audit
```

## Seed

```powershell
npm run seed:documents
```
