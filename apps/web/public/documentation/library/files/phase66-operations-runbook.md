---
title: "Phase 66 Operations Runbook"
subtitle: "Create rollout"
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

# Phase 66 Operations Runbook

> **Phase documentation**
> Create rollout

## Document Control

| Field | Detail |
|---|---|
| Purpose | Enterprise platform overview and buyer evaluation reference |
| Audience | Business leaders, platform administrators, evaluators, partners, and technical stakeholders |
| Scope | Capabilities, architecture, security, deployment, adoption, outcomes, and terminology |
| Source | ServicePro repository documentation; technical meaning preserved |

> [!NOTE]
> This publication edition improves navigation, document metadata, and cross-format consistency. Product and technical claims remain those of the source document.

## Create rollout

```powershell
npm run release:rollout-create
```

## Advance rollout

```powershell
npm run release:rollout-advance
```

## Evaluate rollback

```powershell
npm run release:rollback-evaluate
```

A paused rollout should not be manually forced forward. Correct the failing health condition or execute an authorized rollback.
