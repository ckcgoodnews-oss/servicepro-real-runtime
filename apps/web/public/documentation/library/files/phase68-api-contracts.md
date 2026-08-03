---
title: "Phase 68 API Contracts"
subtitle: "POST /release-intelligence/risk/evaluate"
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

# Phase 68 API Contracts

> **Phase documentation**
> POST /release-intelligence/risk/evaluate

## Document Control

| Field | Detail |
|---|---|
| Purpose | Enterprise platform overview and buyer evaluation reference |
| Audience | Business leaders, platform administrators, evaluators, partners, and technical stakeholders |
| Scope | Capabilities, architecture, security, deployment, adoption, outcomes, and terminology |
| Source | ServicePro repository documentation; technical meaning preserved |

> [!NOTE]
> This publication edition improves navigation, document metadata, and cross-format consistency. Product and technical claims remain those of the source document.

## POST `/release-intelligence/risk/evaluate`

Evaluates a release risk profile.

Returns HTTP `200` when below the blocking threshold and HTTP `409` when blocked.

## POST `/release-intelligence/performance/analyze`

Analyzes deployment records and returns KPIs, per-strategy performance, a preferred strategy, and recommendations.
