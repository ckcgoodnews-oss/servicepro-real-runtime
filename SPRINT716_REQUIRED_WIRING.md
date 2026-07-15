# Sprint 716 Required Wiring

- Set `NEXT_PUBLIC_API_BASE_URL` to the public ServicePro API origin.
- Render: deploy `apps/web` using `apps/web/render.yaml`.
- Cloudflare Pages: use `apps/web` as the root, `npm run build:pages` as the
  build command, and `out` as the output directory.
- Keep the API service health check at `/healthz`; the web service uses `/`.
- Add the final web origins to the API `CORS_ALLOWED_ORIGINS` value.
- Sprint 717 must replace the demonstration login form with the production
  identity/session flow before the dashboard is treated as protected.
