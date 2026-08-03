---
title: "Sprint 44 - Core Service Modules"
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

# Sprint 44 - Core Service Modules

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

Implemented contracts:
- Customer service.
- Job service.
- Estimate service.
- Invoice service.
- Dispatch service.
- Pricing calculator.
- Shared money/address/entity types.
- Domain event outbox model.
- Service operation logs.
- Pricing calculation logs.

Production follow-up:
- Implement repositories against PostgreSQL.
- Implement service classes.
- Add transaction boundaries.
- Add event outbox publisher.
- Add route/controller integration.
- Add unit tests for pricing and service behavior.
