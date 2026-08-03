---
title: "Sprint 52 - PostgreSQL Adapter Contracts"
subtitle: "ServicePro product and operations documentation"
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

# Sprint 52 - PostgreSQL Adapter Contracts

> **Sprint documentation**
> ServicePro product and operations documentation

## Document Control

| Field | Detail |
|---|---|
| Purpose | Enterprise platform overview and buyer evaluation reference |
| Audience | Business leaders, platform administrators, evaluators, partners, and technical stakeholders |
| Scope | Capabilities, architecture, security, deployment, adoption, outcomes, and terminology |
| Source | ServicePro repository documentation; technical meaning preserved |

> [!NOTE]
> This publication edition improves navigation, document metadata, and cross-format consistency. Product and technical claims remain those of the source document.

This sprint prepares the runtime to switch from JSON to PostgreSQL.

Implemented:
- `DATA_STORE=json|postgres`
- Store provider factory.
- JSON adapter.
- PostgreSQL adapter contract.
- Customer repository factory.
- Job repository factory.
- PostgreSQL customers/jobs target migration.
- Environment validation.

The PostgreSQL adapter intentionally declares the runtime surface but does not yet use the `pg` package. Sprint 53 should implement the actual `pg` adapter and wire the API runtime to repositories.
