---
title: "Sprint 61 - Scheduling and Dispatch Runtime"
subtitle: "What changed"
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

# Sprint 61 - Scheduling and Dispatch Runtime

> **Sprint documentation**
> What changed

## Document Control

| Field | Detail |
|---|---|
| Purpose | Enterprise platform overview and buyer evaluation reference |
| Audience | Business leaders, platform administrators, evaluators, partners, and technical stakeholders |
| Scope | Capabilities, architecture, security, deployment, adoption, outcomes, and terminology |
| Source | ServicePro repository documentation; technical meaning preserved |

> [!NOTE]
> This publication edition improves navigation, document metadata, and cross-format consistency. Product and technical claims remain those of the source document.

Apply this patch over Sprint 60.

## What changed

- Added technicians.
- Added appointments.
- Added schedule conflict detection.
- Added dispatch assignments.
- Added scheduling/dispatch RBAC permissions.
- Added JSON and PostgreSQL repositories.
- Added PostgreSQL migration.

## Endpoints

```text
GET  /api/v1/technicians
POST /api/v1/technicians

GET    /api/v1/appointments
POST   /api/v1/appointments
GET    /api/v1/appointments/:id
PATCH  /api/v1/appointments/:id
DELETE /api/v1/appointments/:id

GET   /api/v1/dispatch
POST  /api/v1/dispatch
PATCH /api/v1/dispatch/:id/status
```

## Example appointment body

```json
{
  "jobId": "job_demo_1",
  "customerId": "cust_demo_1",
  "technicianId": "tech_demo_1",
  "startTime": "2026-07-06T14:00:00.000Z",
  "endTime": "2026-07-06T15:00:00.000Z"
}
```
