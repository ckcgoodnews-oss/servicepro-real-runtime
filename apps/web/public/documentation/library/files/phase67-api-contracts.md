---
title: "Phase 67 API Contracts"
subtitle: "Environment status"
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

# Phase 67 API Contracts

> **Phase documentation**
> Environment status

## Document Control

| Field | Detail |
|---|---|
| Purpose | Enterprise platform overview and buyer evaluation reference |
| Audience | Business leaders, platform administrators, evaluators, partners, and technical stakeholders |
| Scope | Capabilities, architecture, security, deployment, adoption, outcomes, and terminology |
| Source | ServicePro repository documentation; technical meaning preserved |

> [!NOTE]
> This publication edition improves navigation, document metadata, and cross-format consistency. Product and technical claims remain those of the source document.

## Environment status

`GET /api/release-command-center/environments`

Returns current release, health, rollout state, and incident count by environment.

## Timeline

`GET /api/release-command-center/timeline?limit=100`

Returns authorization, promotion, rollout, rollback, and incident events ordered newest first.

## Audit explorer

`GET /api/release-command-center/audit`

Supported filters:

- actor
- action
- resourceType
- outcome
- limit

## Dashboard builder

`POST /api/release-command-center/dashboard/build`

Builds summary KPIs, environment status, and timeline data from supplied governed release records.
