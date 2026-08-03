---
title: "Sprint 54 - Executable PostgreSQL Runtime"
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

# Sprint 54 - Executable PostgreSQL Runtime

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

Apply this patch over Sprint 53.

## What changed

- `pg` dependency added.
- Real PostgreSQL adapter implemented.
- Customer repository supports PostgreSQL CRUD.
- Job repository supports PostgreSQL CRUD.
- Migration runner added.
- PostgreSQL seed script added.
- Runtime remains compatible with JSON mode.

## Commands

### Install

```powershell
npm install
```

### Run JSON mode

```powershell
$env:DATA_STORE="json"
npm run dev
```

### Run PostgreSQL mode

```powershell
$env:DATA_STORE="postgres"
$env:DATABASE_URL="postgresql://servicepro:servicepro@localhost:5432/servicepro"
npm run migrate
node scripts/seed-postgres.js
npm run dev
```

### Test API

```powershell
Invoke-RestMethod -Headers @{Authorization='Bearer dev-token-change-me'; 'x-tenant-id'='tenant_demo'} http://localhost:3000/api/v1/customers
```
