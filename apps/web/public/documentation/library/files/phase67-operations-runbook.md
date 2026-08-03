---
title: "Phase 67 Operations Runbook"
subtitle: "Generate a local command-center report"
document_type: "Phase documentation"
audience:
  - Business leaders
  - Platform administrators
  - Buyers and evaluators
  - Partners and technical stakeholders
status: "Publication edition"
published: "2026-08-03"
source_of_truth: "ServicePro repository"
---

# Phase 67 Operations Runbook

> **Phase documentation**
> Generate a local command-center report

## Document Control

| Field | Detail |
|---|---|
| Purpose | Enterprise platform overview and buyer evaluation reference |
| Audience | Business leaders, platform administrators, evaluators, partners, and technical stakeholders |
| Scope | Capabilities, architecture, security, deployment, adoption, outcomes, and terminology |
| Source | ServicePro repository documentation; technical meaning preserved |

> [!NOTE]
> This publication edition improves navigation, document metadata, and cross-format consistency. Product and technical claims remain those of the source document.

## Generate a local command-center report

```powershell
npm run release:command-center-report
```

## Run command-center tests

```powershell
npm run test:sprint766
npm run test:phase67
```

## API endpoints

- `GET /api/release-command-center/environments`
- `GET /api/release-command-center/timeline`
- `GET /api/release-command-center/audit`
- `POST /api/release-command-center/dashboard/build`
- `POST /api/release-command-center/audit`

## Operational rule

The command center is an observability and governance plane. It must not directly bypass promotion, rollout, quarantine, or rollback controls.
