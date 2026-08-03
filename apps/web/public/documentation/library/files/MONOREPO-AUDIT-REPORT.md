---
title: "ServicePro Monorepo Audit Report"
subtitle: "1. Frontend Pages/Routes"
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

# ServicePro Monorepo Audit Report

> **Operations and reference**
> 1. Frontend Pages/Routes

## Document Control

| Field | Detail |
|---|---|
| Purpose | Enterprise platform overview and buyer evaluation reference |
| Audience | Business leaders, platform administrators, evaluators, partners, and technical stakeholders |
| Scope | Capabilities, architecture, security, deployment, adoption, outcomes, and terminology |
| Source | ServicePro repository documentation; technical meaning preserved |

> [!NOTE]
> This publication edition improves navigation, document metadata, and cross-format consistency. Product and technical claims remain those of the source document.

> Generated: July 29, 2026 | Version: 8.0.0-alpha.1

---

## 1. Frontend Pages/Routes

### Public (no auth required) — 9 pages

| Route | Purpose |
|-------|---------|
| `/` | Landing/marketing page |
| `/login` | Sign-in form |
| `/register` | Account creation |
| `/forgot-password` | Password reset request |
| `/reset-password` | Password reset confirmation |
| `/mfa` | MFA code verification |
| `/invite` | Team invitation acceptance |
| `/activate-access` | Owner access token redemption |
| `/p` | Public storefront (via `?business=slug`) |

### Authenticated (workspace layout) — 30 pages

| Route | Feature Area |
|-------|-------------|
| `/dashboard` | Operations overview with KPIs |
| `/work-orders` | Job/work order management |
| `/schedule` | Appointment scheduling |
| `/customers` | Customer CRM |
| `/assets` | Equipment/asset management |
| `/knowledge` | Knowledge base articles |
| `/notifications` | Notification inbox |
| `/organization` | Org structure (departments, locations) |
| `/reports` | Reporting and analytics |
| `/marketplace` | App marketplace (platform admin) |
| `/docs` | Documentation workspace |
| `/docs/help` | Help center |
| `/dispatch` | Dispatch board (drag & drop) |
| `/crm` | CRM pipeline / leads |
| `/invoices` | Invoice management |
| `/inventory` | Inventory tracking |
| `/marketing` | Marketing campaigns |
| `/estimates` | Estimate creation |
| `/financials` | Financial dashboard |
| `/ai-assistant` | AI chat interface |
| `/ai-knowledge` | AI knowledge management |
| `/automation` | Workflow automation builder |
| `/services` | Service catalog |
| `/storefront-builder` | Public storefront editor |
| `/website-builder` | Website page editor |
| `/technicians` | Technician management |
| `/team` | Team management (owner role) |
| `/platform-admin` | Platform administration (admin role) |
| `/profile` | User profile/preferences |
| `/settings` | Settings hub |
| `/system-status` | Deployment diagnostics |

---

## 2. Backend API Endpoints

### Health (public, no auth)
- `GET /healthz` — Health check
- `GET /readyz` — Readiness probe

### Auth (public, no auth)
- `POST /auth/login` — Login
- `POST /auth/register` — Register
- `POST /auth/refresh` — Token refresh
- `POST /auth/password-reset/request` — Request reset
- `POST /auth/password-reset/confirm` — Confirm reset
- `POST /auth/invitations/accept` — Accept invitation
- `POST /auth/mfa/verify` — MFA verification
- `POST /auth/logout` — Logout (requires auth)

### Public Storefront
- `GET /api/public/storefront/:slug` — Public business page
- `POST /api/public/storefront/:slug` — Service request
- `GET /tenant-profile` — Public tenant profile

### Customer Portal (portal auth)
- `POST /portal/login` — Portal login
- `GET /portal/api/me` — Portal user info
- `GET /portal/api/tenant-profile` — Tenant branding
- `GET/POST /portal/api/bookings` — Booking management
- `GET /portal/api/invoices` — View invoices
- `GET /portal/api/estimates` — View estimates

### Core Business CRUD (authenticated, permission-gated)
| Base Path | Methods | Feature |
|-----------|---------|---------|
| `/api/v1/customers` | GET/POST/PATCH/DELETE | Customer management |
| `/api/v1/jobs` | GET/POST/PATCH/DELETE | Work orders |
| `/api/v1/services` | GET/POST/PATCH/DELETE | Service catalog |
| `/api/v1/estimates` | GET/POST/PATCH/DELETE | Estimates |
| `/api/v1/invoices` | GET/POST/PATCH/DELETE | Invoices |
| `/api/v1/payments` | GET/POST/PATCH/DELETE | Payments |
| `/api/v1/technicians` | GET/POST/PATCH | Technicians |
| `/api/v1/appointments` | GET/POST/PATCH/DELETE | Scheduling |
| `/api/v1/inventory` | GET/POST/PATCH/DELETE | Inventory |
| `/api/v1/materials` | GET/POST | Materials/parts |
| `/api/v1/dispatch` | GET/POST/PATCH | Dispatch operations |

### CRM & Marketing
- `/api/v1/crm/leads` — Full CRUD + pipeline
- `/api/v1/marketing/campaigns` — Full CRUD + stats + send

### AI & Knowledge
- `/api/v1/ai/knowledge` — Article CRUD + search
- `/api/v1/ai/chat` — AI chat
- `/api/v1/ai/search` — AI-powered search
- `/api/v1/knowledge` — Knowledge base articles + attachments

### Automation & Workflows
- `/api/v1/automation/workflows` — Full CRUD + execute + history
- `/api/v1/automation/triggers` — Available triggers
- `/api/v1/automation/actions` — Available actions
- `/api/v1/workflows` — Workflow rules
- `/api/v1/jobs/:id/transition` — State machine transitions

### Website Builder
- `/api/v1/website/pages` — Page CRUD + publish
- `/api/v1/website/theme` — Theme GET/PATCH
- `/api/v1/website/media` — Media upload/list/delete
- `/api/v1/website/templates` — Section templates

### Files
- `/api/v1/files` — List, upload, delete

### Reporting & Analytics
- `/api/v1/dashboard/summary` — Dashboard KPIs
- `/api/v1/reports` — Catalog + run by ID
- `/api/v1/reports/dashboard` — Report dashboard
- `/api/v1/reports/schedules` — Scheduled reports CRUD
- `/api/v1/exports` — Data exports

### Notifications
- `/api/v1/notifications` — List/create/process/mark-read
- `/api/v1/notifications/templates` — Template management

### Organization & Assets
- `/api/v1/organization` — Org units CRUD
- `/api/v1/assets` — Asset CRUD + history + attachments

### User & Profile
- `/api/v1/me` — Current user
- `/api/v1/profile` — GET/PATCH + password + MFA + API tokens

### Tenant & Settings
- `/api/v1/tenant/settings` — GET/PATCH
- `/api/v1/tenant/branding` — PATCH
- `/api/v1/tenant/features` — PATCH
- `/api/v1/storefront/themes` — GET
- `/api/v1/storefront/starter-services` — GET

### Marketplace
- `/api/v1/app-marketplace` — Catalog + installations

### Security & Compliance
- `/api/v1/security/events` — Security events
- `/api/v1/security/rate-limits` — Rate limit info
- `/api/v1/integrity` — Integrity checks
- `/api/v1/audit` — Audit trail
- `/api/v1/observability/metrics` — Observability
- `/api/v1/observability/summary` — Summary metrics

### Privacy Operations (extensive)
- `/api/v1/privacy/cases` — Case orchestration
- `/api/v1/privacy/dsars` — DSAR management
- `/api/v1/privacy/consents` — Consent records
- `/api/v1/privacy/retention-policies` — Data retention
- `/api/v1/privacy/deletion-jobs` — Deletion management
- `/api/v1/privacy/processing-activities` — Processing records
- `/api/v1/privacy/dpias` — Impact assessments
- `/api/v1/privacy/breaches` — Breach management
- `/api/v1/privacy/discovery-scans` — Data discovery
- `/api/v1/privacy/appeals` — Appeal management
- `/api/v1/privacy/compliance-evidence` — Compliance evidence
- `/api/v1/privacy/risk-findings` — Risk findings
- `/api/v1/privacy/monitoring-controls` — Monitoring
- `/api/v1/privacy/data-transfers` — Data transfers
- Plus metrics endpoints for each privacy domain

### Platform Admin
- `/api/v1/access/redeem` — Access token redemption
- `/api/v1/access/modules` — Module access info
- `/api/v1/team` — Team CRUD
- `/api/v1/platform/tenant-dashboard` — TMC dashboard
- `/api/v1/platform/owners` — Owner management + token issuance + password reset
- `/api/v1/platform/tenant-management` — Tenant lifecycle CRUD
- `/api/v1/platform/tmc/*` — Tenant Management Center (25+ sub-routes)
- `/api/v1/admin/workspaces` — Workspace list
- `/api/v1/workspace/current` — Current workspace

### Phase-Based Enterprise Routes (dispatched)
| Prefix | Phase | Domain |
|--------|-------|--------|
| `/api/v1/governance/` | 09 | GRC governance |
| `/api/v1/ai-platform/` | 10 | AI platform services |
| `/api/v1/platform-operations/` | 11 | Platform ops |
| `/api/v1/marketplace/` | 12 | Marketplace |
| `/api/v1/enterprise-analytics/` | 13 | Analytics |
| `/api/v1/enterprise-production/` | 14 | Production |
| `/api/v1/post-ga-lts/` | 15 | Post-GA LTS |
| `/api/v1/enterprise-intelligence/` | 16 | Intelligence |
| `/api/v1/global-scale/` | 17 | Global scale |
| `/api/v1/industry-solutions/` | 18 | Industry solutions |
| `/api/v1/platform-extensibility/` | 19 | Extensibility |
| `/api/v1/version3-foundation/` | 20–45 | V3–V7 features |

---

## 3. Major Feature Capabilities

| Domain | Services | Repositories | Status |
|--------|----------|-------------|--------|
| **Auth & Identity** | tokenService, passwordService, portalTokenService | userRepo, authEventRepo, authSessionRepo, accessEntitlementsRepo | Available |
| **Tenant Management** | tenantResolver, tenantSettingsService, platformAdminService | tenantSettingsRepo, tenantManagementRepo, tenantManagementCenterRepo, workspaceRepo | Available |
| **CRM** | customerService | customerRepo, crmLeadsRepo | Available |
| **Scheduling & Dispatch** | scheduleService | appointmentRepo, dispatchRepo, technicianRepo | Available |
| **Work Orders** | jobService, workflowService | jobRepo, workflowRepo | Available |
| **Billing** | paymentService, pricingService, billingMonetizationService | invoiceRepo, estimateRepo, paymentRepo, priceBookRepo | Available |
| **Inventory** | inventoryService | inventoryRepo, materialUsageRepo, warehouseRepo, purchaseOrderRepo | Available |
| **Customer Portal** | portalService | portalAccountRepo, portalBookingRepo | Available |
| **AI** | aiDispatchService, aiGovernanceService | aiKnowledgeRepo, aiDispatchRepo | Available |
| **Marketplace** | marketplaceService | serviceMarketplaceRepo, marketplaceRepo | Available |
| **Website Builder** | — | websiteBuilderRepo | Available |
| **Storefront** | — (via publicStorefront route) | tenantSettingsRepo | Available |
| **Notifications** | notificationService, communicationService | notificationRepo, messageTemplateRepo, communicationRepo | Available |
| **Reporting** | reportingService, csvExportService, biDashboardService | reportRepo, reportScheduleRepo, biDashboardRepo | Available |
| **Security** | securityIncidentService + 5 others | securityEventRepo + 8 others | Available |
| **Privacy** | 12 privacy services | 12 privacy repositories | Available |
| **Governance** | 17 governance services | 17 governance repositories | Available |
| **Automation** | workflowService | automationRepo, workflowRepo | Available |
| **Files & Media** | mediaService, storageService | mediaAttachmentRepo | Available |

---

## 4. Frontend → Backend Mapping

| Frontend Page | API Dependencies |
|--------------|-----------------|
| `/dashboard` | `GET /api/v1/dashboard/summary` |
| `/work-orders` | `GET/POST/PATCH /api/v1/jobs` |
| `/schedule` | `GET/POST /api/v1/appointments` |
| `/customers` | `GET/POST/PATCH /api/v1/customers` |
| `/dispatch` | `GET /api/v1/dispatch`, `GET /api/v1/technicians` |
| `/crm` | `GET /api/v1/crm/leads`, `GET /api/v1/crm/pipeline` |
| `/invoices` | `GET /api/v1/invoices`, `GET /api/v1/payments` |
| `/estimates` | `GET/POST /api/v1/estimates` |
| `/inventory` | `GET /api/v1/inventory` |
| `/marketing` | `GET/POST /api/v1/marketing/campaigns` |
| `/ai-assistant` | `POST /api/v1/ai/chat`, `GET /api/v1/ai/search` |
| `/ai-knowledge` | `GET/POST /api/v1/ai/knowledge` |
| `/automation` | `GET/POST /api/v1/automation/workflows` |
| `/website-builder` | `GET/POST /api/v1/website/pages`, `GET/PATCH /api/v1/website/theme` |
| `/storefront-builder` | `GET /api/v1/tenant/settings`, `GET /api/v1/services`, `PATCH /api/v1/tenant/branding`, `GET /api/v1/storefront/themes` |
| `/marketplace` | `GET /api/v1/app-marketplace` |
| `/reports` | `GET /api/v1/reports`, `GET /api/v1/reports/dashboard` |
| `/notifications` | `GET /api/v1/notifications` |
| `/knowledge` | `GET/POST /api/v1/knowledge` |
| `/assets` | `GET/POST /api/v1/assets` |
| `/organization` | `GET/POST /api/v1/organization` |
| `/platform-admin` | `GET /api/v1/platform/tenant-dashboard`, `GET /api/v1/platform/owners`, `GET /api/v1/admin/workspaces` |
| `/team` | `GET/POST /api/v1/team` |
| `/profile` | `GET/PATCH /api/v1/profile` |
| `/settings` | `GET/PATCH /api/v1/tenant/settings` |
| `/p` (storefront) | `GET /api/public/storefront/:slug` |
| `/login` | `POST /auth/login` |

### Shared Auth Flow
All authenticated pages use `AuthGuard` → calls `GET /api/v1/me` → redirects to `/login` on 401, `/activate-access` on 402.

### Middleware Chain (every authenticated request)
1. `requestId` → unique ID
2. `securityHeaders` → response headers
3. `cors` → origin whitelist
4. `bodyLimit` → payload size
5. `tenant` → tenant ID from header
6. `requestContext` → attach repositories
7. `rateLimit` → throttling
8. `requestAudit` + `requestMetrics` → observability
9. `authGuard` → JWT verification
10. `ownerAccessGuard` → subscription check
11. `moduleAccessGuard` → feature module check
12. `attachOperationalTenant` → resolve tenant UUID

---

## 5. Documentation & Test References

### Documentation (docs/)
- `docs/deployment-checklist.md` — Production deployment steps
- `docs/release/8.0.0-alpha.1/` — Release certification docs (7 files)
- `docs/sales/` — Enterprise sales documentation
- `docs/sales-kit/` — Complete sales & marketing kit (10 documents)
- `docs/image-generation-prompts.md` — AI hero image prompts
- `docs/MONOREPO-AUDIT-REPORT.md` — This document

### Tests (551 files in tests/)
- Smoke tests for each sprint (sprint47–sprint774)
- Platform admin tests (workspace, owner provisioning, TMC)
- Integration tests (phases 65–71)
- Domain tests (payments, privacy, CRM, auth, portal)
- Infrastructure tests (render, postgres, supabase, package integrity)

### Key Config Files
- `render.yaml` — Render deployment blueprint
- `wrangler.toml` (apps/web) — Cloudflare Pages config
- `docker-compose.yml` — Dev environment
- `docker-compose.production.yml` — Production environment
- `package.json` — 629 npm scripts

---

## Summary Stats

| Metric | Count |
|--------|-------|
| Frontend pages | 39 |
| Backend route modules | 166 |
| Services | 155 |
| Repositories | 177 |
| Middleware | 16 |
| Test files | 551 |
| Database migrations | 685 |
| Marketplace packs | 30 |
| Phase modules | 37 (phases 09–45) |
| npm scripts | 629 |
