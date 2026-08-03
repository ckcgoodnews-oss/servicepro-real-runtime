---
title: "ServicePro 8.0.0-alpha.1 — Test Evidence"
subtitle: "Traceability"
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

# ServicePro 8.0.0-alpha.1 — Test Evidence

> **Release documentation**
> Traceability

## Document Control

| Field | Detail |
|---|---|
| Purpose | Enterprise platform overview and buyer evaluation reference |
| Audience | Business leaders, platform administrators, evaluators, partners, and technical stakeholders |
| Scope | Capabilities, architecture, security, deployment, adoption, outcomes, and terminology |
| Source | ServicePro repository documentation; technical meaning preserved |

> [!NOTE]
> This publication edition improves navigation, document metadata, and cross-format consistency. Product and technical claims remain those of the source document.

**Evidence date:** 2026-07-27
**Environment:** Windows, Node.js 22.13.0, npm, Docker Desktop, PostgreSQL 16.14, Redis 7.4.10

| Command or exercise | Result |
|---|---|
| Root `npm ci` | Pass; deterministic install; 0 vulnerabilities reported |
| Frontend `npm ci` | Pass; valid dependency tree |
| Frontend offline audit | Pass; 0 vulnerabilities reported |
| `npm run web:typecheck` | Pass |
| `npm run build` | Pass; API syntax, TypeScript, Next.js production build, 43 routes, Render validation |
| `npm test` | Pass; all 763 test files |
| `npm run scripts:check` | Pass; all 619 package commands resolve |
| Blank PostgreSQL migration | Pass; all 685 migrations |
| Migration replay | Pass; 0 applied and 685 skipped |
| `npm run deploy:smoke:postgres` | Pass; readiness, login, dashboard |
| PostgreSQL business-flow exercise | Pass; customer through payment audit plus tenant isolation |
| PostgreSQL backup/restore exercise | Pass; restored counts and authenticated smoke |
| Redis `PING` | Pass |
| Browser login | Pass; owner authenticated and redirected to dashboard |
| Browser dashboard | Pass; live tenant KPIs/work displayed, no console errors |
| Browser customer workspace | Pass; active navigation and persisted customer/service data |
| Browser mobile check | Pass; 390×844, menu controls functional, no horizontal overflow, no console errors |
| Production Compose without required environment | Pass as a safety test; configuration fails closed |
| Production Compose with documented example | Pass; configuration parses |

## Traceability

Remediation commits:

- `1eb9e96` payment transaction integrity
- `ad4d169` release test reconciliation
- `5008ac1` runtime configuration normalization
- `69fe643` package-command integrity
- `5220b02` deterministic frontend build
- `e9b1169` production deployment alignment
- `8a6c0a3` PostgreSQL migration/runtime compatibility

Raw console output is intentionally not committed because it is machine-specific and may contain operational metadata. The commands above are the reproducible evidence boundary.
