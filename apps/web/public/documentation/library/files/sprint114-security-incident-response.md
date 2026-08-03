---
title: "Sprint 114 - Security Incident Response"
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

# Sprint 114 - Security Incident Response

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

Apply this patch over Sprint 113.

## Endpoints to wire

```text
GET  /api/v1/security-incidents
POST /api/v1/security-incidents
POST /api/v1/security-incidents/:id/transition
GET  /api/v1/security-incidents/:id/tasks
POST /api/v1/security-incidents/:id/tasks
POST /api/v1/security-incidents/tasks/:id/complete
GET  /api/v1/security-incidents/:id/evidence
POST /api/v1/security-incidents/:id/evidence
POST /api/v1/security-incidents/evidence/:id/custody
GET  /api/v1/security-incidents/:id/notifications
POST /api/v1/security-incidents/:id/notifications
POST /api/v1/security-incidents/notifications/:id/send
POST /api/v1/security-incidents/notifications/:id/fail
GET  /api/v1/security-incidents/:id/postmortems
POST /api/v1/security-incidents/:id/postmortems
POST /api/v1/security-incidents/postmortems/:id/approve
POST /api/v1/security-incidents/postmortems/:id/publish
GET  /api/v1/security-incidents/metrics
```

## Seed

```powershell
npm run seed:security-incidents
```
