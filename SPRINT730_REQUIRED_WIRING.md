# Sprint 730 Required Wiring

- All sidebar and settings destinations must resolve to authenticated workspace routes.
- Render must use `apps/web/render.yaml`; Cloudflare Pages must use `apps/web/wrangler.toml` and the `out` directory.
- `NEXT_PUBLIC_API_BASE_URL` must point to the public API and all website origins must be included in API `CORS_ALLOWED_ORIGINS`.
- CI must run the Node regression suite plus both Render and Cloudflare Pages website builds.
- `PHASE46_RELEASE_MANIFEST.json` is the machine-readable Phase 46 package contract.
- Create and push `v8.0.0-alpha.1` only after the Sprint 730 commit and every release gate succeeds.
