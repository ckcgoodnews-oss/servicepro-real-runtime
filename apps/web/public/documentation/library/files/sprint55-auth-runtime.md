---
title: "Sprint 55 - Auth Runtime"
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

# Sprint 55 - Auth Runtime

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

Apply this patch over Sprint 54.

## What changed

- Added `/auth/login`.
- Added `/api/v1/me`.
- Added HMAC JWT-style access token service.
- Replaced static token guard with token verification.
- Added password hashing using bcryptjs.
- Added user repository for JSON and PostgreSQL.
- Added auth seed script.
- Added runtime auth PostgreSQL migration.

## Commands

```powershell
npm install
npm test
```

Run JSON mode:

```powershell
$env:DATA_STORE="json"
npm run reset
npm run dev
```

Login:

```powershell
Invoke-RestMethod -Method Post -ContentType "application/json" -Body '{"email":"owner@example.com","password":"ChangeMe123!"}' http://localhost:3000/auth/login
```

PostgreSQL mode:

```powershell
$env:DATA_STORE="postgres"
npm run migrate
node scripts/seed-auth.js
npm run dev
```
