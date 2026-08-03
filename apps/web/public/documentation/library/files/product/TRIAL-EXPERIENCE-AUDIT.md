---
title: "Trial Experience Audit"
subtitle: "1. What Already Exists"
document_type: "Product"
audience:
  - Business leaders
  - Platform administrators
  - Buyers and evaluators
  - Partners and technical stakeholders
status: "Publication edition"
published: "2026-08-03"
source_of_truth: "ServicePro repository"
---

# Trial Experience Audit

> **Product**
> 1. What Already Exists

## Document Control

| Field | Detail |
|---|---|
| Purpose | Enterprise platform overview and buyer evaluation reference |
| Audience | Business leaders, platform administrators, evaluators, partners, and technical stakeholders |
| Scope | Capabilities, architecture, security, deployment, adoption, outcomes, and terminology |
| Source | ServicePro repository documentation; technical meaning preserved |

> [!NOTE]
> This publication edition improves navigation, document metadata, and cross-format consistency. Product and technical claims remain those of the source document.

**Date:** August 2026
**Repository:** D:\ServiceRepo

---

## 1. What Already Exists

### Subscription/Billing Infrastructure
- `src/services/billing.js` — Legacy billing with plan codes (starter/growth/pro), `trialing` status, Stripe stubs
- `apps/api/src/services/billingMonetizationService.js` — Full subscription model with `trialing` status, `trialDays` per plan, entitlements, invoices, payments, credits, dunning
- `apps/api/src/repositories/billingMonetizationRepository.js` — Repository with `checkEntitlement()` method
- `SUBSCRIPTION_STATUSES = ['trialing', 'active', 'past_due', 'paused', 'cancelled', 'expired']`

### Registration Flow
- `apps/web/src/app/register/page.tsx` — Registration page exists
- `apps/web/src/components/RegisterForm.tsx` — Simple form (name, email, password)
- `apps/api/src/routes/auth.js` → `register()` — Gated by `ALLOW_PUBLIC_REGISTRATION=true` env var
- Creates user with `technician` role in the existing tenant context
- No tenant provisioning — registers within an existing workspace

### Platform Admin Concepts
- `apps/admin/src/pages/platform/config/GlobalSettingsPage.tsx` — Has `trialDays` and `signupEnabled` fields
- `apps/admin/src/pages/platform/DashboardPage.tsx` — Shows `trialTenants` count
- `apps/admin/src/pages/platform/subscriptions/PlansPage.tsx` — Shows `trialing` status option
- `apps/admin/src/pages/platform/support/AnnouncementsPage.tsx` — Has `trial` audience option

### Platform Dashboard
- `apps/api/src/routes/platformTenantDashboard.js` — Treats `status === 'trial'` as healthy
- `apps/api/src/repositories/platformOperationsCenterRepository.js` — Counts `subscriptionStatus === 'trialing'`

### "Start Free" Button
- `apps/web/src/components/PublicHeader.tsx` — "Start free" button links to `/login` (incorrect)

### Multi-Tenant Provisioning
- Platform admin can create owners via `PlatformAdminWorkspace.tsx`
- `apps/api/src/routes/platformAccess.js` — `createOwner()` provisions tenant + user
- No self-service public tenant creation

---

## 2. What Is Incomplete

| Component | Status |
|-----------|--------|
| Self-service trial registration | Missing — current register creates user in existing tenant only |
| Trial tenant provisioning | Missing — only admin can create tenants |
| Email verification | Missing — no outbound email, no verification tokens |
| Trial duration tracking | Missing — no `trial_started_at` / `trial_expires_at` on tenant |
| Trial expiration enforcement | Missing — no middleware checks trial status |
| Onboarding checklist | Missing — no guided setup |
| Product tour / walkthrough | Missing — no tour library |
| Industry selection during signup | Missing — no trial-time industry picker |
| Industry pack installation (self-service) | Missing — exists for admin only |
| Sample data provisioning | Missing — seed scripts exist but not user-triggered |
| Upgrade flow | Missing — billing checkout is a stub |
| Trial dashboard banner | Missing — no days-remaining display |
| Trial notifications | Missing — no lifecycle emails |
| Trial admin panel | Partial — admin UI has trial status fields but no trial management |
| Trial analytics/funnel | Missing — no event tracking for trial conversion |

---

## 3. Nonfunctional Buttons

| Button/CTA | Location | Current Behavior | Required |
|------------|----------|-----------------|----------|
| "Start free" | PublicHeader.tsx | Links to /login | Link to /start-free |

---

## 4. Missing Routes

| Route | Purpose |
|-------|---------|
| `POST /api/v1/trial/register` | Self-service trial signup |
| `POST /api/v1/trial/verify-email` | Email verification |
| `POST /api/v1/trial/resend-verification` | Resend verification |
| `GET /api/v1/trial/status` | Trial status for current user |
| `POST /api/v1/trial/select-industry` | Set industry during onboarding |
| `POST /api/v1/trial/install-pack` | Install industry configuration |
| `POST /api/v1/trial/sample-data` | Seed sample data |
| `DELETE /api/v1/trial/sample-data` | Remove sample data |
| `GET /api/v1/trial/onboarding` | Get onboarding progress |
| `PATCH /api/v1/trial/onboarding/:step` | Complete onboarding step |
| `POST /api/v1/trial/upgrade-request` | Request upgrade / contact sales |

---

## 5. Database Records

- No trial-specific columns on tenant table currently
- Subscription model supports `trialing` status but not self-provisioned
- No `trial_started_at`, `trial_expires_at` fields in existing schema
- Entitlement model exists and can be reused for trial limits

---

## 6. Implementation Plan

Build the full trial system leveraging:
- Existing `billingMonetizationService.js` for subscription/entitlement model
- Existing `auth.js` registration logic (password validation, session issuance)
- Existing platform admin tenant creation pattern
- Existing industry/service catalog in `publicStorefront.js`

New components needed:
- Trial registration route + service
- Trial provisioning service (extends platform access pattern)
- Trial middleware (check expiration)
- Onboarding service + routes
- Frontend: start-free page, trial dashboard, onboarding UI
- Migration: trial fields on tenant_settings
