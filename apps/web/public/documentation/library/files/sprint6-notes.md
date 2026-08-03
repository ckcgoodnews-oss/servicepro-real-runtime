---
title: "Sprint 6 Notes"
subtitle: "Features"
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

# Sprint 6 Notes

> **Sprint documentation**
> Features

## Document Control

| Field | Detail |
|---|---|
| Purpose | Enterprise platform overview and buyer evaluation reference |
| Audience | Business leaders, platform administrators, evaluators, partners, and technical stakeholders |
| Scope | Capabilities, architecture, security, deployment, adoption, outcomes, and terminology |
| Source | ServicePro repository documentation; technical meaning preserved |

> [!NOTE]
> This publication edition improves navigation, document metadata, and cross-format consistency. Product and technical claims remain those of the source document.

Sprint 6 adds operational controls for running ServicePro as a tenant-safe SaaS platform.

## Features

- Audit viewer for owner/manager/installer roles.
- Tenant backup generation into `data/backups`.
- Live tenant JSON export download.
- Tenant import/restore UI with merge and replace modes.
- Health dashboard and CLI health script.
- Public health endpoints for uptime checks.

## Safety model

All backup/export/import actions are scoped to the signed-in user's `tenant_id`. Platform-level users can view audit logs across tenants, but tenant users only see their own events.

## Recommended use

Before importing a replacement tenant export, create a backup first from `/admin/backups`.
