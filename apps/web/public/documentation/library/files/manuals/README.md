---
title: "ServicePro Role-Based Documentation Suite"
subtitle: "Manuals"
document_type: "Operations and reference"
audience:
  - Business leaders
  - Platform administrators
  - Buyers and evaluators
  - Partners and technical stakeholders
status: "Publication edition"
published: "2026-08-03"
source_of_truth: "ServicePro repository"
---

# ServicePro Role-Based Documentation Suite

> **Operations and reference**
> Manuals

## Document Control

| Field | Detail |
|---|---|
| Purpose | Enterprise platform overview and buyer evaluation reference |
| Audience | Business leaders, platform administrators, evaluators, partners, and technical stakeholders |
| Scope | Capabilities, architecture, security, deployment, adoption, outcomes, and terminology |
| Source | ServicePro repository documentation; technical meaning preserved |

> [!NOTE]
> This publication edition improves navigation, document metadata, and cross-format consistency. Product and technical claims remain those of the source document.

The in-application Documents workspace is the authoritative rendered manual. It applies runtime role filtering:

| Viewer | Available manuals |
| --- | --- |
| Platform administrator | Platform Admin, Developer/Integration, Owner, Staff |
| Tenant owner | Owner, Staff |
| Staff/technician | Staff |

Internal platform and developer procedures must not be copied into tenant-visible knowledge articles. The source content is maintained in `apps/web/src/components/DocumentationWorkspace.tsx`.

## Manuals

- Platform Administrator Guide — Render, Cloudflare, Supabase, migrations, RLS, storage, secrets, owner access, module entitlements, themes, audit, releases.
- Web Developer & Technical Integration Guide — architecture, guards, repositories, environment variables, module/migration/theme extensibility.
- Business Owner Guide — activation, entitlement boundaries, teams, storefronts, service pages, and leads.
- Staff & Field Technician Guide — permissions, daily operations, customers, jobs, assets, inventory, billing boundaries, and security.

## Documentation change control

1. Update the in-application manual.
2. Confirm the intended `audience`.
3. Add or update tests for access filtering and required content.
4. Run the frontend production build.
5. Have a platform administrator review security-sensitive instructions.
6. Deploy the same commit to the API and web environments.
