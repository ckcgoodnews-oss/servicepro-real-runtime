---
title: "Sprint 56 - Runtime RBAC"
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

# Sprint 56 - Runtime RBAC

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

Apply this patch over Sprint 55.

## What changed

- Added permission catalog.
- Added role preset expansion.
- Added `requirePermission` middleware.
- Protected customer/job CRUD by permission.
- Added `/api/v1/authz`.
- Added auth event repository.
- JSON seed now includes owner and technician users.
- Technician can read/write jobs but cannot delete customers/jobs.
- Added PostgreSQL RBAC metadata migration.

## Test users

```text
owner@example.com / ChangeMe123!
tech@example.com / ChangeMe123!
```

## Commands

```powershell
npm install
npm test
```
