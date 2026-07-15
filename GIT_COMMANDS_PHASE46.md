# Phase 46 Git Commands

Sprint 716 is the first incremental commit in Phase 46.

```powershell
git switch -c codex/sprint-716-frontend-foundation
npm install --prefix apps/web
npm run web:test
npm run web:build
npm test
npm run migrations:check
git add -- apps/web tests/sprint716-frontend-foundation.test.js SPRINT716_REQUIRED_WIRING.md PHASE46_RELEASE_NOTES.md GIT_COMMANDS_PHASE46.md package.json .github/workflows/ci.yml
git commit -m "Sprint 716: add enterprise web foundation"
git push -u origin codex/sprint-716-frontend-foundation
```

Sprint 717 continuation:

```powershell
npm run web:test
npm run web:typecheck
npm run web:build
npm run web:build:pages
npm test
npm run migrations:check
git add -- apps/api apps/web packages/database/postgres/717_enterprise_web_identity.sql tests/sprint717-enterprise-web-auth.test.js PHASE46_RELEASE_NOTES.md SPRINT717_REQUIRED_WIRING.md GIT_COMMANDS_PHASE46.md package.json
git commit -m "Sprint 717B: complete enterprise web authentication"
git push origin codex/sprint-716-frontend-foundation
```

Sprint 718 continuation:

```powershell
npm run test:sprint718
npm run web:typecheck
npm run web:build
npm run web:build:pages
npm test
git add -- apps/api/src/routes/dashboard.js apps/api/src/router.js apps/web/src/app/dashboard apps/web/src/components/DashboardOverview.tsx apps/web/src/app/globals.css tests/sprint718-live-dashboard.test.js SPRINT718_REQUIRED_WIRING.md PHASE46_RELEASE_NOTES.md GIT_COMMANDS_PHASE46.md package.json
git commit -m "Sprint 718: connect live operations dashboard"
git push origin codex/sprint-716-frontend-foundation
```

Sprint 719 continuation:

```powershell
npm run test:sprint719
npm run web:typecheck
npm run web:build
npm run web:build:pages
npm test
git add -- apps/web/src/app/dashboard apps/web/src/components/AppShell.tsx apps/web/src/app/globals.css tests/sprint719-navigation-framework.test.js SPRINT719_REQUIRED_WIRING.md WEBSITE_TESTING.md PHASE46_RELEASE_NOTES.md GIT_COMMANDS_PHASE46.md package.json
git commit -m "Sprint 719: add application navigation framework"
git push origin codex/sprint-716-frontend-foundation
```

After review:

```powershell
git switch main
git pull --ff-only origin main
git merge --ff-only codex/sprint-716-frontend-foundation
git push origin main
```

Create the Phase 46 tag only after Sprint 730 completes:

```powershell
git tag -a v8.0.0-alpha.1 -m "ServicePro Phase 46 Enterprise Web Experience"
git push origin v8.0.0-alpha.1
```
