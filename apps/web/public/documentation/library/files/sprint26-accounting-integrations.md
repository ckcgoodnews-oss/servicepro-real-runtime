---
title: "Sprint 26 - Accounting Integrations"
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

# Sprint 26 - Accounting Integrations

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

This sprint establishes accounting-provider integration foundations.

Included:
- Provider connection registry
- OAuth token storage model
- QuickBooks Online module boundary
- Xero module boundary
- GL account mapping
- Tax code mapping
- Bank reconciliation model
- Payroll export batches
- Financial reporting API structures

Production follow-up:
- Implement QuickBooks OAuth authorization flow.
- Implement Xero OAuth authorization flow.
- Encrypt provider refresh tokens.
- Add sync workers for customers, invoices, payments, and items.
- Add double-entry ledger enforcement.
- Add accounting-period close controls.
