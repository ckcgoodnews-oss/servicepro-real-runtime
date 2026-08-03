---
title: "Sprint 3 Notes"
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

# Sprint 3 Notes

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

Sprint 3 adds field-service financial and dispatch workflow modules while preserving the simple JSON datastore for local development.

## Added

- Dispatch calendar/list screen
- Technician assignment and scheduled time updates from dispatch
- Estimate creation
- Estimate detail with line items
- Estimate status workflow
- Quote/estimate conversion into a job
- Invoice creation
- Invoice detail with line items
- Manual payment recording
- PostgreSQL target migration for estimates and invoices

## New routes

- `/admin/dispatch`
- `/admin/estimates`
- `/admin/estimates/:id`
- `/admin/invoices`
- `/admin/invoices/:id`

## Notes

This sprint still uses the JSON datastore by default so it can be run without native database dependencies. The PostgreSQL migration is included under `src/db/postgres` for the later production adapter sprint.
