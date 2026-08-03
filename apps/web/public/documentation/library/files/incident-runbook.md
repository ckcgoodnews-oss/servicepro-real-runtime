---
title: "Incident Runbook"
subtitle: "App unavailable"
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

# Incident Runbook

> **Operations and reference**
> App unavailable

## Document Control

| Field | Detail |
|---|---|
| Purpose | Enterprise platform overview and buyer evaluation reference |
| Audience | Business leaders, platform administrators, evaluators, partners, and technical stakeholders |
| Scope | Capabilities, architecture, security, deployment, adoption, outcomes, and terminology |
| Source | ServicePro repository documentation; technical meaning preserved |

> [!NOTE]
> This publication edition improves navigation, document metadata, and cross-format consistency. Product and technical claims remain those of the source document.

## App unavailable

1. Check `/healthz`.
2. Check container/service status.
3. Check recent deployment.
4. Check database connectivity.
5. Roll back if deployment caused issue.

## Database issue

1. Stop write traffic if data integrity is at risk.
2. Snapshot database.
3. Check migrations.
4. Restore only after confirming backup integrity.

## Security event

1. Disable affected account/API key.
2. Preserve audit logs.
3. Rotate secrets if needed.
4. Notify affected tenant if required.
