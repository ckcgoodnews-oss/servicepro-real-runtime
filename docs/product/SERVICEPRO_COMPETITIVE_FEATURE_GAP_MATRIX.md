# ServicePRO Competitive Feature Gap Matrix

## Overview

This document maps ServicePRO's current capabilities against HubSpot (CRM, Sales, Marketing, Service, Content, Commerce, Operations) and monday.com (Work Management, CRM, Service, Dashboards, Workflows) to identify gaps, partial implementations, and competitive advantages.

**Assessment Date:** 2026-08-04  
**Version:** 8.0.0-alpha.1  
**Assessor:** Platform Architecture Team

---

## Status Legend

| Status | Meaning |
|--------|---------|
| ✅ Existing | Fully implemented and operational |
| 🟡 Partial | Partially implemented, needs expansion |
| ❌ Missing | Not yet implemented |
| 🔧 Broken | Exists but non-functional |
| 🔄 Duplicate | Redundant implementation exists |
| 📦 Legacy | Old implementation needs modernization |
| 📋 Planned | Designed but not built |
| ➖ N/A | Not applicable to ServicePRO |

---

## 1. CRM — Contact & Company Management

| Capability | Status | Notes | Existing Module | Priority |
|-----------|--------|-------|-----------------|----------|
| Customer records | ✅ Existing | Full CRUD via `/api/v1/customers` | customersRepository | P0 |
| Company records | 🟡 Partial | Customers serve as companies; no separate company entity | customersRepository | P1 |
| Contact records (multi per company) | ❌ Missing | Need separate contacts linked to customers/companies | — | P1 |
| Custom properties | 🟡 Partial | Tenant settings has custom fields; no per-object custom props | tenantSettingsRepository | P2 |
| Property groups | ❌ Missing | — | — | P2 |
| Record associations (graph) | 🟡 Partial | Jobs link to customers; no universal association system | — | P1 |
| Activity timeline | 🟡 Partial | Audit log exists; no unified cross-entity timeline | auditRepository | P1 |
| Notes | 🟡 Partial | Job notes exist; no universal notes system | — | P2 |
| Tasks | ❌ Missing | No standalone task management | — | P2 |
| Calls | ❌ Missing | No call logging system | — | P3 |
| Meetings | ❌ Missing | Appointments exist for scheduling; no meeting logging | appointmentsRepository | P3 |
| Emails (logged) | ❌ Missing | No email activity tracking | — | P3 |
| Attachments (universal) | 🟡 Partial | File upload exists; per-asset attachments | fileUpload, customerAssets | P2 |
| Lists/Segments | 🟡 Partial | Marketing campaigns have audience; no universal list builder | marketingCampaignsRepository | P2 |
| Imports | ❌ Missing | Import templates exist in frontend but no backend | — | P2 |
| Exports | ✅ Existing | `/api/v1/exports` with permission controls | exportsRoute | P2 |
| Duplicate management | ❌ Missing | No duplicate detection or merge | — | P3 |
| Lead assignment (round-robin) | ❌ Missing | CRM leads exist but no auto-assignment | crmLeadsRepository | P2 |
| Lead scoring | ❌ Missing | — | — | P3 |

## 2. CRM — Deals & Pipeline

| Capability | Status | Notes | Existing Module | Priority |
|-----------|--------|-------|-----------------|----------|
| Deal records | ❌ Missing | CRM leads have pipeline; no separate deals entity | crmLeads | P1 |
| Multiple pipelines | 🟡 Partial | Single CRM pipeline exists | crmLeadsRepository | P1 |
| Custom stages | 🟡 Partial | Lead statuses configurable; not full deal stages | — | P1 |
| Stage probability | ❌ Missing | — | — | P2 |
| Deal amount/value | ❌ Missing | — | — | P1 |
| Expected close date | ❌ Missing | — | — | P1 |
| Forecasting | ❌ Missing | Sprint 394 seeds exist (phase-based) | phase24 | P2 |
| Win/loss reasons | ❌ Missing | — | — | P2 |
| Competitors | ❌ Missing | — | — | P3 |
| Deal health/inactivity | ❌ Missing | — | — | P2 |
| Products on deals | ❌ Missing | — | — | P2 |

## 3. Sales Enablement

| Capability | Status | Notes | Existing Module | Priority |
|-----------|--------|-------|-----------------|----------|
| Email templates | 🟡 Partial | Notification templates exist | notificationsRepository | P2 |
| Sales sequences | ❌ Missing | — | — | P3 |
| Meeting scheduler | ❌ Missing | Appointments are internal scheduling | — | P3 |
| Calling/Call recording | ❌ Missing | — | — | P4 |
| Document sharing | 🟡 Partial | File upload/media exists | fileUpload | P3 |
| Playbooks | ❌ Missing | — | — | P4 |
| Quotes/CPQ | ✅ Existing | Estimates serve as quotes | estimatesRepository | P1 |
| Product catalog | ✅ Existing | Services + price books | servicesRepository, priceBookRepository | P1 |
| Pricing rules | ✅ Existing | Price book system | priceBookRepository | P2 |
| Quote approvals | ❌ Missing | — | — | P2 |

## 4. Marketing

| Capability | Status | Notes | Existing Module | Priority |
|-----------|--------|-------|-----------------|----------|
| Campaign management | ✅ Existing | `/api/v1/marketing/campaigns` | marketingCampaignsRepository | P3 |
| Campaign stats | ✅ Existing | `/api/v1/marketing/stats` | marketingCampaignsRepository | P3 |
| Forms | 🟡 Partial | Website builder has forms; portal bookings | websiteBuilder | P3 |
| Landing pages | 🟡 Partial | Website builder page editor | websiteBuilder | P3 |
| Email marketing | 🟡 Partial | Campaign send exists; no drag-and-drop editor | marketingCampaignsRepository | P5 |
| Audience segmentation | ❌ Missing | — | — | P5 |
| Nurture automation | ❌ Missing | Workflow engine exists but no nurture sequences | automation | P5 |
| A/B testing | ❌ Missing | — | — | P6 |
| Revenue attribution | ❌ Missing | — | — | P5 |
| Consent/suppression | ❌ Missing | Privacy system has consent but not marketing consent | privacy* | P5 |

## 5. Customer Service

| Capability | Status | Notes | Existing Module | Priority |
|-----------|--------|-------|-----------------|----------|
| Ticketing | ❌ Missing | Portal bookings exist but no formal ticket system | portalBookingRepository | P4 |
| Shared inbox | ❌ Missing | Communication center exists | communicationCenterService | P4 |
| Live chat | ❌ Missing | AI chat is internal only | aiAssistant | P5 |
| Customer portal | ✅ Existing | Portal with bookings, invoices, estimates | portal routes | P0 |
| Knowledge base | ✅ Existing | `/api/v1/knowledge` + AI search | knowledge, aiAssistant | P0 |
| SLA management | ✅ Existing | SLA service | slaService | P4 |
| Routing/assignment | ❌ Missing | Dispatch exists for field service; no ticket routing | dispatchRepository | P4 |
| Customer feedback | 🟡 Partial | Surveys exist (sprint 92) | customerSurveyRepository | P4 |
| Customer health score | 🟡 Partial | Sprint 261 seeds exist | phase15PostGaLts | P4 |

## 6. Work Management (monday.com parity)

| Capability | Status | Notes | Existing Module | Priority |
|-----------|--------|-------|-----------------|----------|
| Workspaces | ✅ Existing | Multi-workspace tenant system | workspaces | P0 |
| Boards | ❌ Missing | No configurable board system | — | P3 |
| Groups/Items/Subitems | ❌ Missing | Jobs have line items; no generic board items | — | P3 |
| Custom columns | ❌ Missing | — | — | P3 |
| Status/Priority columns | 🟡 Partial | Jobs have status; not configurable per board | jobsRepository | P3 |
| Views (Table/Kanban/Calendar/Timeline/Gantt) | 🟡 Partial | CRM has pipeline kanban; no generic views | crmLeads | P3 |
| Dependencies | ❌ Missing | — | — | P3 |
| Recurring items | 🟡 Partial | Recurring services/agreements exist | agreementService | P3 |
| Templates | 🟡 Partial | Job templates exist | templateService | P3 |
| Time tracking | ✅ Existing | Time tracking service | timeTrackingService | P3 |
| Automations | ✅ Existing | Workflow automation engine | automation, workflows | P0 |
| Dashboards (configurable) | 🟡 Partial | Dashboard summary exists; not configurable widgets | dashboard | P3 |

## 7. Projects & Portfolios

| Capability | Status | Notes | Existing Module | Priority |
|-----------|--------|-------|-----------------|----------|
| Projects | ❌ Missing | Jobs serve as work orders; no formal project entity | — | P3 |
| Programs/Portfolios | ❌ Missing | — | — | P4 |
| Gantt chart | ❌ Missing | — | — | P3 |
| Resource planning | 🟡 Partial | Technician scheduling exists | scheduleService | P3 |
| Workload view | ❌ Missing | — | — | P3 |
| Budget tracking | ❌ Missing | — | — | P4 |
| Risk register | 🟡 Partial | Enterprise risk register (sprint 160) | phase09Governance | P4 |

## 8. Field Service (Competitive Advantage)

| Capability | Status | Notes | Existing Module | Priority |
|-----------|--------|-------|-----------------|----------|
| Dispatch command center | ✅ Existing | Full dispatch system | dispatchRepository | P0 |
| Technician scheduling | ✅ Existing | Appointments, schedule service | scheduleService | P0 |
| Route planning | ✅ Existing | Route planning service | routePlanningService | P0 |
| Skills/Certifications | ✅ Existing | Technician profiles | techniciansRepository | P0 |
| Territories | ✅ Existing | Territory service | territoryService | P0 |
| Work orders | ✅ Existing | Jobs = work orders | jobsRepository | P0 |
| Recurring services | ✅ Existing | Service agreements | agreementService | P0 |
| Inspections/Checklists | ✅ Existing | QA inspections, mobile checklists | qaInspectionService | P0 |
| Photos/Documents | ✅ Existing | Media attachments | fileUpload | P0 |
| Parts/Inventory | ✅ Existing | Inventory + warehouses + purchasing | inventoryRepository, warehouseService | P0 |
| Equipment/Assets | ✅ Existing | Customer assets with history | customerAssetRepository | P0 |
| Preventive maintenance | ✅ Existing | Predictive maintenance service | predictiveMaintenanceService | P0 |
| Customer signatures | ✅ Existing | Mobile forms (sprint 376) | — | P0 |
| Technician mobile | ✅ Existing | Mobile offline (sprint 372) | — | P0 |
| GPS/Time tracking | ✅ Existing | Time tracking + fleet/GIS | timeTrackingService | P0 |

## 9. Commerce & Revenue

| Capability | Status | Notes | Existing Module | Priority |
|-----------|--------|-------|-----------------|----------|
| Products/Services catalog | ✅ Existing | Services + price books | servicesRepository | P0 |
| Quotes/Estimates | ✅ Existing | Full estimate system | estimatesRepository | P0 |
| Invoices | ✅ Existing | Full invoice system | invoiceRepository | P0 |
| Payments | ✅ Existing | Payment processing | paymentRepository | P0 |
| Subscriptions/Recurring billing | ✅ Existing | Subscription + billing service | subscriptionService, billingMonetizationService | P0 |
| Financing | ✅ Existing | Customer financing | financing | P2 |
| Revenue reporting | 🟡 Partial | Reports exist; no dedicated revenue dashboards | reports | P2 |

## 10. Automation & Workflows

| Capability | Status | Notes | Existing Module | Priority |
|-----------|--------|-------|-----------------|----------|
| Workflow rules (trigger-action) | ✅ Existing | `/api/v1/workflows` + automation routes | workflows, automation | P0 |
| Triggers (record events) | ✅ Existing | Automation triggers | automation | P3 |
| Conditions | ✅ Existing | Automation conditions | automation | P3 |
| Actions | ✅ Existing | Automation actions + executions | automation | P3 |
| Execution history | ✅ Existing | `/api/v1/automation/executions` | automation | P3 |
| Visual workflow builder | ✅ Existing | AutomationBuilder component | AutomationBuilder (frontend) | P3 |

## 11. AI & Intelligence

| Capability | Status | Notes | Existing Module | Priority |
|-----------|--------|-------|-----------------|----------|
| AI knowledge search | ✅ Existing | `/api/v1/ai/search` + `/ai/chat` | aiAssistant | P0 |
| AI assistant | ✅ Existing | Full AI chat interface | aiAssistant | P0 |
| AI dispatch | ✅ Existing | AI-powered dispatch optimization | aiDispatchService | P0 |
| Predictive maintenance | ✅ Existing | Equipment failure prediction | predictiveMaintenanceService | P0 |
| AI governance | ✅ Existing | Full AI governance framework (phases 10, 16) | phase10AiPlatform | P0 |
| Deal-risk insights | ❌ Missing | — | — | P6 |
| Email writing assist | ❌ Missing | — | — | P6 |

## 12. Platform & Operations

| Capability | Status | Notes | Existing Module | Priority |
|-----------|--------|-------|-----------------|----------|
| Multi-tenancy | ✅ Existing | Schema-per-tenant | tenantMiddleware | P0 |
| Authentication (JWT) | ✅ Existing | Full auth with MFA | auth | P0 |
| RBAC permissions | ✅ Existing | Dynamic permission discovery | permissions.js | P0 |
| Audit logging | ✅ Existing | `/api/v1/audit` | auditRepository | P0 |
| API rate limiting | ✅ Existing | Rate limit middleware | rateLimit.js | P0 |
| Webhooks | ✅ Existing | Phase 12 marketplace | phase12Marketplace | P0 |
| Notifications | ✅ Existing | Template-based with queue | notifications | P0 |
| Observability | ✅ Existing | Metrics + summary | observability | P0 |
| Data integrity | ✅ Existing | Integrity checks | integrity | P0 |

---

## Summary

| Category | Existing | Partial | Missing | Total | Coverage |
|----------|----------|---------|---------|-------|----------|
| CRM Core | 2 | 7 | 10 | 19 | 29% |
| Deals/Pipeline | 0 | 2 | 9 | 11 | 9% |
| Sales Enablement | 3 | 2 | 5 | 10 | 40% |
| Marketing | 2 | 3 | 5 | 10 | 35% |
| Customer Service | 3 | 2 | 4 | 9 | 44% |
| Work Management | 3 | 4 | 5 | 12 | 42% |
| Projects | 0 | 2 | 5 | 7 | 14% |
| Field Service | 15 | 0 | 0 | 15 | 100% |
| Commerce | 6 | 1 | 0 | 7 | 93% |
| Automation | 5 | 0 | 0 | 5 | 100% |
| AI | 5 | 0 | 2 | 7 | 71% |
| Platform | 9 | 0 | 0 | 9 | 100% |

**Overall: 53 Existing, 23 Partial, 45 Missing = 121 total capabilities assessed**

---

## Recommended Implementation Order

1. **Unified record associations** (P1) — Foundation for all cross-entity features
2. **Deals/Opportunities pipeline** (P1) — Revenue operations core
3. **Contact-company split** (P1) — CRM modernization
4. **Activity timeline** (P1) — Cross-entity visibility
5. **Configurable boards** (P3) — Work management layer
6. **Ticketing system** (P4) — Customer service hub
7. **Marketing nurture** (P5) — Growth engine
8. **Meeting scheduler** (P3) — Sales enablement
