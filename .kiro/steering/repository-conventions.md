# Repository Conventions

## Project Overview

ServicePro is a multi-tenant SaaS field service management platform.

- **Version:** 8.0.0-alpha.1
- **API:** Node.js raw HTTP server (`apps/api/src/server.js`)
- **Frontend:** Next.js 15 with React 19 (`apps/web/`)
- **Database:** PostgreSQL 16 on Supabase (schema-per-tenant)
- **Deploy:** Render (API), Cloudflare Workers (Web)

## Architecture Patterns

### API Layer

- Routes are registered in `apps/api/src/router.js` via if-chain pattern matching
- Route handlers live in `apps/api/src/routes/`
- Business logic lives in `apps/api/src/services/`
- Data access via repository pattern in `apps/api/src/repositories/`
- Middleware in `apps/api/src/middleware/`
- All routes return JSON via `sendJson(res, statusCode, body)`
- Parse request bodies with `parseJsonBody(req)` (already done in router for POST/PATCH/PUT)

### Multi-Tenancy

- Tenant ID comes from JWT claims or `x-tenant-id` header
- `tenantMiddleware(req)` sets `req.tenantId`
- All repository queries MUST include tenant scoping
- Platform admin routes bypass tenant scoping via `attachOperationalTenant`

### Frontend

- Components in `apps/web/src/components/` (TSX)
- Single route file at `apps/web/src/routes/`
- API calls use `authFetch` from `src/lib/api.ts`
- Static export mode (no SSR) — Cloudflare Workers deployment
- Styling via CSS files in `apps/web/src/app/`

## Coding Standards

### General

- Use existing patterns — check similar files before creating new ones
- No new npm dependencies without justification
- Keep files under 400 lines when possible
- Prefer `.js` for API code (existing convention), `.tsx` for frontend

### API Endpoints

When adding a new route:
1. Create route handler in `apps/api/src/routes/yourRoute.js`
2. Create repository in `apps/api/src/repositories/yourRepository.js`
3. Add route matching to `apps/api/src/router.js`
4. Include permission check: `if (!requirePermission(PERMISSIONS.YOUR_PERM)(req, res)) return;`
5. Always scope queries by `req.tenantId`

### Database

- Migrations go in `migrations/postgres/` with sequential numbering
- Migrations MUST be idempotent (use IF NOT EXISTS, ON CONFLICT DO NOTHING)
- Always include tenant_id column on tenant-scoped tables
- Use parameterized queries (never string interpolation for SQL)

### Frontend Components

- Use TypeScript for all new frontend code
- Use `authFetch` for authenticated API calls
- Handle loading and error states explicitly
- Use existing CSS class patterns — avoid inline styles

## Critical Rules

1. **NEVER** overwrite `tenant_settings.branding` without merging with existing values (`...current`)
2. **NEVER** use `defaultTenantSettings()` with hardcoded business names
3. **ALWAYS** test with both workspaces: `tenant_demo` (Aqua Pro Plumbing) and `cd_tenant_demo` (C & D Landscaping)
4. **ALWAYS** ensure CORS includes all production origins
5. **NEVER** push sales documentation to remote
6. **ALWAYS** use `requestSubmit()` for programmatic form submission (cast to HTMLFormElement for TypeScript)

## Environment

- Platform admin email: `5189213@gmail.com`
- Production API: `api.aardvark-enterprises.net`
- Production Web: `app.aardvark-enterprises.net`
- Storefront slugs: `aquapro` (plumbing), `cand` (landscaping)
- Free Render tier: 50s+ cold start delay expected
- Supabase keep-alive: GitHub Action pings every 5 days

## Git Conventions

- Commit messages: `type: description` (feat, fix, chore, docs, refactor)
- Push to main for deployment (no branch protection currently)
- Don't commit `.env` files or secrets
- Don't push `docs/sales/` or `docs/sales-kit/` to remote
