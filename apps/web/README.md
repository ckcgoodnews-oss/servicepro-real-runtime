# ServicePro Web

The ServicePro browser experience is a Next.js 15 application completed through
Phase 46 (Sprints 716–730). It includes the public website, authenticated
operations workspace, multi-industry marketplace, documentation portal,
accessibility controls, and independent deployment targets.

## Local development

```powershell
npm install --prefix apps/web
npm run web:dev
```

The web app runs on `http://localhost:3000` and reads the API origin from
`NEXT_PUBLIC_API_BASE_URL`.

## Builds

- `npm run web:build` creates the standalone Render build.
- `npm run web:build:pages` creates the static Cloudflare Pages build in
  `apps/web/out`.
- `npm run web:test` validates the Sprint 716 route and deployment contract.
- `npm run release:validate:phase46` validates Phase 46 routes, packaging, and deployment contracts.

See `PHASE46_DEPLOYMENT.md` in the repository root for the Render and Cloudflare Pages release checklist.
