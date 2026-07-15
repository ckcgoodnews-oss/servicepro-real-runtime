# Phase 46 Deployment

ServicePro uses two established website deployment targets. The authenticated browser application calls the separately deployed API through `NEXT_PUBLIC_API_BASE_URL`.

## Render

- Blueprint: `apps/web/render.yaml`
- Root directory: `apps/web`
- Build: `npm ci && npm run build`
- Health check: `/`
- Required value: `NEXT_PUBLIC_API_BASE_URL` set to the public HTTPS API origin

The build produces the Next.js standalone deployment contract. Validate it with `npm run web:build` and confirm `/`, `/login`, `/dashboard`, and `/docs` return successful responses after deployment.

## Cloudflare Pages

- Configuration: `apps/web/wrangler.toml`
- Root directory: `apps/web`
- Build: `npm run build:pages`
- Output directory: `out`
- Required value: `NEXT_PUBLIC_API_BASE_URL` set to the public HTTPS API origin

The Pages target is a static export. Validate it with `npm run web:build:pages` and confirm the generated route directories exist in `apps/web/out`.

## API coordination

Add every final website origin to the API `CORS_ALLOWED_ORIGINS` value. Keep API secrets and database credentials on the API service only; public frontend variables must never contain secrets. Confirm the API `/healthz` endpoint before website smoke testing.

## Release gate

Run `npm run release:validate:phase46`, migration ordering, web type checking, both web builds, and the complete test suite. The release tag is `v8.0.0-alpha.1`.
