---
title: "ServicePro 8.0.0-alpha.1 — Remediation Tracker"
subtitle: "ServicePro product and operations documentation"
document_type: "Release documentation"
audience:
  - Business leaders
  - Platform administrators
  - Buyers and evaluators
  - Partners and technical stakeholders
status: "Publication edition"
published: "2026-08-03"
source_of_truth: "ServicePro repository"
---

# ServicePro 8.0.0-alpha.1 — Remediation Tracker

> **Release documentation**
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

**Status:** Closed for locally testable release blockers

| ID | Finding | Resolution | Verification | Commit |
|---|---|---|---|---|
| RB-01 | Payment application implementation missing | Restored validation, partial/full status transitions, timestamps, JSON audit events, and transactional PostgreSQL row locking/audit writes | Payment domain and Sprint 58/60 tests; PostgreSQL partial/full payment flow | `1eb9e96` |
| RB-02 | Seven release tests had drifted from current architecture | Reconciled navigation, Cloudflare static assets, migration invariants, and legitimate duplicate-table expectations | Complete suite | `ad4d169` |
| RB-03 | Runtime environment values were inconsistently normalized | Added centralized normalization and validation without exposing secrets | Configuration normalization tests | `5008ac1` |
| RB-04 | Package scripts referenced missing files | Removed never-implemented commands and added a 619-command integrity gate | `npm run scripts:check`; complete suite | `69fe643` |
| RB-05 | Frontend installation/build was not deterministic | Established npm lockfile ownership, documented clean install, and corrected CSS compatibility warning | Clean `npm ci`; typecheck; 43-route Next.js build | `5220b02` |
| RB-06 | Production manifests allowed unsafe or ephemeral configuration | Aligned version, persistent PostgreSQL, pre-deploy migration, explicit secret/origin inputs, and fail-closed Compose settings | Render validator, deployment tests, Compose validation | `e9b1169` |
| RB-07 | Blank PostgreSQL migration failed at late CRM/AI migrations | Made migration 779 additive/compatible, removed undeclared pgvector dependency from 780, and implemented live CRM/marketing adapters | Blank 685-migration run, idempotent replay, regression test | `8a6c0a3` |
| RB-08 | Dashboard test failed near local/UTC midnight | Made test data use one UTC instant instead of mixing local noon with UTC comparison | Focused test and complete 763-file suite | Pending certification commit |

No known locally reproducible blocker remains open.
