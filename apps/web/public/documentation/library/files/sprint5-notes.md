---
title: "Sprint 5 Notes"
subtitle: "New Admin Screens"
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

# Sprint 5 Notes

> **Sprint documentation**
> New Admin Screens

## Document Control

| Field | Detail |
|---|---|
| Purpose | Enterprise platform overview and buyer evaluation reference |
| Audience | Business leaders, platform administrators, evaluators, partners, and technical stakeholders |
| Scope | Capabilities, architecture, security, deployment, adoption, outcomes, and terminology |
| Source | ServicePro repository documentation; technical meaning preserved |

> [!NOTE]
> This publication edition improves navigation, document metadata, and cross-format consistency. Product and technical claims remain those of the source document.

Adds production-oriented platform features without breaking local development:

- Storage provider service layer
- Local upload mode remains default
- S3-compatible staged mode via `STORAGE_MODE=s3`
- Tenant billing/subscription tables
- Plan usage tracking
- Stripe Checkout stub events
- Tenant custom domain settings
- Domain resolution middleware
- Production hardening checklist

## New Admin Screens

- `/admin/storage`
- `/admin/billing`
- `/admin/domains`
- `/admin/production`

## Notes

S3 and Stripe are staged safely in this sprint. No real cloud calls are required for `npm install`, `npm run setup`, or `npm run dev`. Sprint 6 should replace the S3 stub with a real SDK `PutObjectCommand` and add Stripe webhook processing.
