---
title: "Sprint 74 - Tenant Administration Runtime"
subtitle: "Added"
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

# Sprint 74 - Tenant Administration Runtime

> **Sprint documentation**
> Added

## Document Control

| Field | Detail |
|---|---|
| Purpose | Enterprise platform overview and buyer evaluation reference |
| Audience | Business leaders, platform administrators, evaluators, partners, and technical stakeholders |
| Scope | Capabilities, architecture, security, deployment, adoption, outcomes, and terminology |
| Source | ServicePro repository documentation; technical meaning preserved |

> [!NOTE]
> This publication edition improves navigation, document metadata, and cross-format consistency. Product and technical claims remain those of the source document.

Apply this patch over Sprint 73.

## Added

- Tenant settings
- Branding/white-label configuration
- Feature flags
- Public tenant profile
- Admin tenant routes
- PostgreSQL tenant settings migration

## Endpoints

```text
GET   /tenant-profile
GET   /portal/api/tenant-profile

GET   /api/v1/tenant/settings
PATCH /api/v1/tenant/settings
PATCH /api/v1/tenant/branding
PATCH /api/v1/tenant/features
```

## Seed command

```powershell
npm run seed:tenant
```

## Example branding body

```json
{
  "appName": "My Field Service",
  "primaryColor": "#005bbb",
  "portalWelcomeTitle": "Welcome"
}
```

## Example feature body

```json
{
  "inventory": true,
  "reports": true,
  "customerPortal": true
}
```
