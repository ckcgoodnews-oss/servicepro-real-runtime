# Codex Continuation Prompt — Trial Marketplace & Public Website Generation

You are continuing implementation of the Trial Marketplace feature for ServicePro. The backend service layer, API routes, repository, and migration are committed. You must now build the remaining layers.

## Git State

```bash
cd D:\ServiceRepo      # Or Y:\ServiceRepo or I:\ServiceRepo depending on machine
git pull --rebase origin main
# Current commit: ca9e38b on main
# Remote: https://github.com/ckcgoodnews-oss/servicepro-real-runtime.git
```

## What Is Already Built

| Layer | File | Status |
|-------|------|--------|
| Service | `apps/api/src/services/trialMarketplaceService.js` | ✅ Complete |
| Routes | `apps/api/src/routes/trialMarketplace.js` | ✅ Complete (5 endpoints) |
| Repository | `apps/api/src/repositories/trialSiteRepository.js` | ✅ Complete (JSON + Postgres) |
| Migration | `migrations/postgres/775_trial_marketplace_sites.sql` | ✅ Complete |
| Router wiring | `apps/api/src/router.js` | ✅ Wired |
| Factory alias | `apps/api/src/repositories/repositoryFactory.js` | ✅ `trialSite: 'trialSites'` |

### API Endpoints Available

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| GET | `/api/v1/trial/marketplace/offerings` | Yes | List eligible service packs |
| POST | `/api/v1/trial/marketplace/select` | Yes | Confirm 1–3 selections, generate + publish site |
| GET | `/api/v1/trial/site` | Yes | Get site status, content, allowed edit fields |
| PATCH | `/api/v1/trial/site` | Yes | Apply restricted edits (server allowlist) |
| GET | `/api/v1/trial/site/leads` | Yes | List leads attributed to this trial site |

### Key Design Decisions Already Made

- **Eligible offerings**: Only `service_pack` items (30 industry packs). No connectors/themes/extensions.
- **Expiration**: Site goes offline. Returns branded "setting up" page with ServicePro trial CTA. Data preserved 30 days.
- **Post-expiration leads**: Public form shows redirect to ServicePro trial signup.
- **URL**: Clean slug from company name (e.g., `/p/acme-plumbing`). Preserved on conversion.
- **Trial branding**: `trialBadge: true` in site content. Small "Powered by ServicePro" badge in footer. Removed after paid conversion.
- **Edit restrictions**: 10 allowed fields (`companyName`, `contactEmail`, `contactPhone`, `tagline`, `description`, `serviceArea`, `hours`, `logoUrl`, `heroImageUrl`, `primaryColor`, `secondaryColor`). All others rejected server-side.
- **Idempotency**: Re-submitting same selections returns existing site without duplication.
- **Field tracking**: Every field has state: `generated`, `user-edited`, or `protected`. Regeneration preserves `user-edited` fields.

## What Must Be Built Next

### Priority 1: Trial Authorization Middleware

File: `apps/api/src/middleware/trialAccessGuard.js`

Implement a middleware that checks if the authenticated user is a trial user and blocks access to prohibited routes. Must:
- Check `req.context.repositories.trials.findByTenantId(req.context.tenantId)`
- If trial exists and status is `active` or `expiring`, enforce route restrictions
- Use `trialMarketplaceService.isRouteBlockedForTrial(req.url)` to check denied patterns
- Return `403` with `{ error: { code: 'trial_restricted', message: 'This feature is not available during trial.' } }`
- If trial is `expired`, block all mutations except upgrade-request and convert
- Wire into `router.js` AFTER `authGuard` but BEFORE the protected route handlers

Denied patterns (already defined in service):
```
/api/v1/platform/, /api/v1/admin/, /api/v1/tenant/settings,
/api/v1/tenant/features, /api/v1/team, /api/v1/authz,
/api/v1/organization, /api/v1/security/, /api/v1/integrity,
/api/v1/observability/, /api/v1/audit
```

### Priority 2: Public Storefront Expiration Handling

File: `apps/api/src/routes/publicStorefront.js` (modify existing)

In the `profile()` function, after resolving the tenant/settings:
- Check if tenant has a trial via `req.context.repositories.trials.findByTenantId()`
- If trial exists and is expired, return the `expiredSiteResponse()` from `trialMarketplaceService`
- The response should include: `{ data: { expired: true, message: '...', cta: 'Start your own free trial', ctaUrl: '/start-free' } }`
- If trial is active/converted, serve normally (existing behavior)

### Priority 3: Frontend — Marketplace Selection Component

File: `apps/web/src/components/TrialMarketplaceSelector.tsx`

A component shown during trial onboarding after industry selection. Must:
- Fetch `/api/v1/trial/marketplace/offerings`
- Display eligible packs as cards with name, description, features, accent color
- Allow selecting 1–3 (checkbox or toggle)
- Show count indicator "X of 3 selected"
- Submit button calls `POST /api/v1/trial/marketplace/select` with `{ selections: [id1, id2, ...] }`
- On success, redirect to trial workspace/dashboard
- On error, show validation messages from server
- Show loading state during provisioning

### Priority 4: Frontend — Trial Workspace/Site Dashboard

File: `apps/web/src/components/TrialSiteDashboard.tsx`

Shown after marketplace selection is confirmed. Must:
- Fetch `GET /api/v1/trial/site` on mount
- Show: company name, public URL (clickable), provisioning state, days remaining
- Show editable fields as a form (only the 10 allowed fields)
- Submit edits via `PATCH /api/v1/trial/site`
- Show which fields have been edited vs generated (visual indicator)
- Show leads list from `GET /api/v1/trial/site/leads`
- Show upgrade CTA when trial is expiring
- Disable editing when trial is expired (show message)

### Priority 5: Frontend — Expired Site Public Page

File: `apps/web/src/components/PublicStorefront.tsx` (modify existing)

When the API returns `{ data: { expired: true } }` for a storefront slug:
- Render a branded "coming soon" page instead of the full storefront
- Show: "This business is setting up their online presence"
- CTA: "Start your own free trial" → `/start-free`
- Minimal ServicePro branding
- Responsive, accessible

### Priority 6: Integration with Onboarding Checklist

Modify `apps/api/src/routes/trial.js` → `selectIndustry()`:
- After industry is selected and pack installed, if `AUTO_MARKETPLACE_SELECT` env is set, auto-confirm the industry pack as the single marketplace selection
- This streamlines the flow: industry → auto-generate site → workspace

Or add a new onboarding step:
```js
{ key: 'marketplace_selection', label: 'Choose your service packs', sequence: 3 }
```

### Priority 7: Tests

Create `tests/trial-marketplace.test.js`:
- Test `validateSelections()` with valid/invalid/duplicate/excess/cross-tenant inputs
- Test `generateSiteContent()` produces expected structure
- Test `applyEdits()` respects allowlist and preserves field states
- Test `regeneratePreservingEdits()` keeps user-edited fields
- Test `isSiteServable()` for each trial status
- Test `expiredSiteResponse()` returns correct shape
- Test `isRouteBlockedForTrial()` for denied and allowed patterns

Create `tests/trial-marketplace-api.test.js`:
- Test `POST /api/v1/trial/marketplace/select` with valid selections
- Test idempotent re-submission
- Test rejection of 4+ selections
- Test rejection of ineligible offering IDs
- Test `PATCH /api/v1/trial/site` with allowed and blocked fields
- Test expired trial blocks edits

## Architecture Constraints

- Use `authFetch` from `@/auth/session` for all frontend API calls
- Follow existing component patterns (see `StorefrontBuilder.tsx`, `TrialBanner.tsx`)
- Use existing CSS patterns (add to `trial.css` or create `trial-marketplace.css`)
- No new npm dependencies
- Keep business logic in services, data access in repositories
- Never expose tenant IDs, billing internals, or permission details to public endpoints
- All mutations must be tenant-scoped via `req.context.tenantId`
- Migrations are sequential, idempotent, and use IF NOT EXISTS / ON CONFLICT

## Environment

- Platform admin: `5189213@gmail.com`
- Active workspaces: `tenant_demo` (Aqua Pro Plumbing), `cd_tenant_demo` (C & D Landscaping)
- Storefront slugs: `aquapro`, `cand`
- API: `api.aardvark-enterprises.net` (Render free tier, 50s cold start)
- Web: Cloudflare Workers (static export)
- DB: Supabase PostgreSQL (ca-central-1)
- Dev vars: `AUTO_VERIFY_TRIAL=true`, `EXPOSE_AUTH_TOKENS=true`

## Commit Conventions

```
feat(trial-marketplace): add authorization middleware
feat(trial-marketplace): add storefront expiration handling
feat(trial-marketplace): add marketplace selection UI
feat(trial-marketplace): add trial site dashboard
test(trial-marketplace): add service and API integration tests
```

## Do NOT

- Do not create parallel auth/tenant/billing systems
- Do not expose privileged database credentials to browser
- Do not hard-code tenant or offering IDs
- Do not weaken existing security checks or disable tests
- Do not overwrite existing storefront/trial code
- Do not fabricate claims, prices, locations, or testimonials in generated content
- Do not allow trial users access to platform admin, user management, permissions, or billing internals
- Do not publish incomplete/partially-generated sites
- Do not delete trial data on expiration (30-day retention)
