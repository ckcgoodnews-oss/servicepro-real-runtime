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
