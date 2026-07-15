# Phase 46 — Enterprise Web Experience

Version 8 browser experience, Sprints 716–730.

## Sprint 716 — Frontend Foundation

- Next.js 15 and TypeScript application in `apps/web`.
- Responsive ServicePro marketing homepage.
- Login and enterprise operations dashboard shells.
- Shared light/dark design tokens and accessible responsive navigation.
- Independent Render and Cloudflare Pages build modes.
- CI, contract tests, environment documentation, and deployment wiring.

## Sprint 717 — Authentication Experience

- Live tenant-aware login, optional registration, logout, and protected dashboard routes.
- Short-lived access tokens with rotating, revocable refresh sessions.
- Password recovery and invitation acceptance backed by hashed, expiring, one-time tokens.
- MFA challenge and verification screen with one-time challenge storage.
- Shared password-policy validation and generic recovery responses that resist account enumeration.
- PostgreSQL migration plus JSON/PostgreSQL repository parity and regression tests.

Production password-reset, invitation, and MFA messages require a configured delivery provider; raw tokens and codes are never returned in production.

## Sprint 718 — Live Operations Dashboard

- Replaced demonstration KPI values with a tenant-scoped dashboard summary API.
- Added open-work, today’s appointments, active-customer, and outstanding-balance KPIs.
- Added prioritized attention items, recent work, activity, notifications, quick actions, and favorites.
- Added loading, error, and empty states while retaining responsive layouts.

## Sprint 719 — Navigation Framework

- Moved authenticated application chrome into a reusable protected layout.
- Added responsive sidebar and mobile drawer navigation with tenant context.
- Added breadcrumbs, keyboard-accessible global search, and route shortcuts.
- Added theme, notifications, profile, settings, and sign-out controls.
- Added a local website testing guide and repeatable development login seed.

## Sprint 720 — User Profile

- Added a protected profile and preferences workspace under the shared application shell.
- Added persisted identity, avatar, timezone, locale, and notification settings.
- Added current-password verification, password-policy enforcement, and session revocation.
- Added email-based MFA controls and hashed, one-time-display personal API tokens.
- Added JSON/PostgreSQL persistence parity, API-token authentication, migration, and regression coverage.

## Sprint 721 — Organization Management

- Added a protected organization-management workspace with summary filters and responsive editing flows.
- Added organizations, business units, departments, locations, and teams with reporting relationships.
- Added tenant-isolated CRUD APIs, role-derived permissions, and child-safe deletion rules.
- Added JSON/PostgreSQL persistence parity, migration wiring, and regression coverage.

## Sprint 722 — Asset Management

- Added a protected asset browser with customer, serial, location, status, and type search and filtering.
- Added equipment details, warranty state, age, lifecycle controls, and customer context.
- Added service-history timelines and attachment metadata workflows in the asset workspace.
- Activated the existing tenant-isolated asset repositories through authenticated APIs and added production search indexes.

## Sprint 723 — Work Orders

- Added list, Kanban, and seven-day calendar views for tenant work orders.
- Added customer-aware search, priority indicators, technician assignments, and schedule windows.
- Connected status actions to the validated workflow-transition API and assignment conflict detection.
- Added responsive operations layouts, production query indexes, and regression coverage.

## Sprint 724 — Knowledge Center

- Added a protected searchable library for field articles and equipment manuals.
- Added equipment metadata, tags, full procedures, editorial AI summaries, and verification guidance.
- Added tenant-isolated JSON/PostgreSQL persistence, authenticated permissions, and production search indexes.
- Added attachment metadata workflows for knowledge resources and technician read access.

## Sprint 725 — Notification Center

- Added a protected user-specific inbox with unread counts, filtering, and individual or bulk read actions.
- Added persistent email, browser push, dispatch, billing, and product preference controls.
- Added browser permission handling and reusable accessible toast confirmations.
- Added tenant and recipient isolation, PostgreSQL read-state indexing, and technician inbox access.

## Sprint 726 — Reporting

- Added a protected reporting workspace with revenue, work-order, inventory, and operations summaries.
- Added responsive CSS charts with visible values and export actions for operational and financial reports.
- Added CSV download history backed by the existing tenant-scoped export engine.
- Added persisted daily, weekly, and monthly report delivery schedules with pause and resume controls.
