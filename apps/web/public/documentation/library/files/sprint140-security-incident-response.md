---
title: "Sprint 140 - Security Incident Response"
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

# Sprint 140 - Security Incident Response

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

Apply this patch over Sprint 139.

## Endpoints to wire

```text
GET  /api/v1/security-incidents/incidents
POST /api/v1/security-incidents/incidents
POST /api/v1/security-incidents/incidents/:id/transition
POST /api/v1/security-incidents/incidents/:id/start-investigation
POST /api/v1/security-incidents/incidents/:id/tasks
GET  /api/v1/security-incidents/tasks
POST /api/v1/security-incidents/tasks/:id/complete
POST /api/v1/security-incidents/incidents/:id/evidence
GET  /api/v1/security-incidents/incidents/:id/evidence
POST /api/v1/security-incidents/incidents/:id/communications
POST /api/v1/security-incidents/communications/:id/approve
POST /api/v1/security-incidents/communications/:id/send
POST /api/v1/security-incidents/incidents/:id/reviews
POST /api/v1/security-incidents/reviews/:id/complete
POST /api/v1/security-incidents/incidents/:id/actions
POST /api/v1/security-incidents/actions/:id/complete
POST /api/v1/security-incidents/actions/:id/accept-risk
GET  /api/v1/security-incidents/metrics
```

## Seed

```powershell
npm run seed:security-incident-response
```
