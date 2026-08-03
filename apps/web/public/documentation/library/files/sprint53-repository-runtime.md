---
title: "Sprint 53 - Repository-Backed Runtime Routes"
subtitle: "Changed"
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

# Sprint 53 - Repository-Backed Runtime Routes

> **Sprint documentation**
> Changed

## Document Control

| Field | Detail |
|---|---|
| Purpose | Enterprise platform overview and buyer evaluation reference |
| Audience | Business leaders, platform administrators, evaluators, partners, and technical stakeholders |
| Scope | Capabilities, architecture, security, deployment, adoption, outcomes, and terminology |
| Source | ServicePro repository documentation; technical meaning preserved |

> [!NOTE]
> This publication edition improves navigation, document metadata, and cross-format consistency. Product and technical claims remain those of the source document.

This patch is intended to apply over Sprint 52.

## Changed

- API routes now use `req.context.repositories`.
- `requestContext` attaches singleton repositories per runtime.
- Customer and job routes no longer import direct services.
- Repository factory now supports singleton runtime reuse.
- JSON mode remains the default.
- PostgreSQL mode remains a contract until the next runtime sprint.

## Next Sprint

Sprint 54 should implement the real PostgreSQL adapter using the `pg` package and make `DATA_STORE=postgres` executable.
