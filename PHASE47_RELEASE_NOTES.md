# Phase 47 - Identity Experience

## Sprint 717A - Web Identity Integration

- Replaced the Sprint 716 demonstration redirect with live ServicePro API authentication.
- Added tenant-aware browser session persistence with separate remembered and tab-only storage.
- Protected the dashboard with a session presence check and server-side token validation through `GET /api/v1/me`.
- Added password recovery, reset, and invitation acceptance experiences.
- Reused IAM workflow ideas from `SBP` and customer-access patterns from `service-site-saas` without importing either project's incompatible Supabase or Express/EJS runtime.
- Added a focused contract test and deployment wiring notes.

This increment intentionally does not claim production backend recovery, invitations, refresh-token rotation, or MFA. Those remain Sprint 717B API/security work.
