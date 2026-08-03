---
title: "Sprint 40 - Authentication and Authorization"
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

# Sprint 40 - Authentication and Authorization

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
- Access token claims.
- Refresh token records.
- Password policy validation.
- Permission catalog.
- Role permission presets.
- RBAC helpers.
- Tenant context helper.
- MFA model.
- Auth audit event catalog.
- API route definitions.
- PostgreSQL auth migration.

Production follow-up:
- Implement NestJS/Express controllers.
- Add bcrypt/argon2 hashing implementation.
- Add JWT signing and verification.
- Add refresh-token rotation.
- Add MFA TOTP provider.
- Add email/SMS password-reset delivery.
- Add audit event persistence middleware.
