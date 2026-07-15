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

Sprint 720 continuation:

```powershell
npm run test:sprint720
npm run migrations:check
npm run web:typecheck
npm run web:build
npm run web:build:pages
npm test
git add -- apps/api/src/middleware/authGuard.js apps/api/src/repositories/userRepository.js apps/api/src/routes/profile.js apps/api/src/router.js apps/api/src/services/validationSchemaService.js apps/api/src/store/jsonStoreAdapter.js apps/web/src/app apps/web/src/auth/session.ts apps/web/src/components/AppShell.tsx apps/web/src/components/ProfileWorkspace.tsx packages/database/postgres/720_user_profile_experience.sql tests/sprint716-frontend-foundation.test.js tests/sprint717-web-identity-integration.test.js tests/sprint719-navigation-framework.test.js tests/sprint720-user-profile-experience.test.js SPRINT720_REQUIRED_WIRING.md PHASE46_RELEASE_NOTES.md GIT_COMMANDS_PHASE46.md package.json
git commit -m "Sprint 720: add user profile experience"
git push origin codex/sprint-716-frontend-foundation
```

Sprint 721 continuation:

```powershell
npm run test:sprint721
npm run migrations:check
npm run web:typecheck
npm run web:build
npm run web:build:pages
npm test
git add -- apps/api/src/repositories/organizationUnitRepository.js apps/api/src/repositories/repositoryFactory.js apps/api/src/routes/organization.js apps/api/src/router.js apps/api/src/services/validationSchemaService.js apps/api/src/store/jsonStoreAdapter.js apps/web/src/app/(workspace)/organization/page.tsx apps/web/src/components/AppShell.tsx apps/web/src/components/OrganizationWorkspace.tsx apps/web/src/app/globals.css packages/database/postgres/721_organization_management.sql tests/sprint721-organization-management.test.js SPRINT721_REQUIRED_WIRING.md PHASE46_RELEASE_NOTES.md GIT_COMMANDS_PHASE46.md package.json
git commit -m "Sprint 721: add organization management"
git push origin codex/sprint-716-frontend-foundation
```

Sprint 722 continuation:

```powershell
npm run test:sprint722
npm run migrations:check
npm run web:typecheck
npm run web:build
npm run web:build:pages
npm test
git add -- apps/api/src/router.js apps/api/src/routes/customerAssets.js apps/api/src/services/validationSchemaService.js apps/api/src/store/jsonStoreAdapter.js apps/web/src/app/(workspace)/assets/page.tsx apps/web/src/components/AssetWorkspace.tsx apps/web/src/app/globals.css packages/database/postgres/722_asset_management_experience.sql tests/sprint722-asset-management.test.js SPRINT722_REQUIRED_WIRING.md PHASE46_RELEASE_NOTES.md GIT_COMMANDS_PHASE46.md package.json
git commit -m "Sprint 722: add asset management experience"
git push origin codex/sprint-716-frontend-foundation
```

Sprint 723 continuation:

```powershell
npm run test:sprint723
npm run migrations:check
npm run web:typecheck
npm run web:build
npm run web:build:pages
npm test
git add -- apps/api/src/store/jsonStoreAdapter.js apps/web/src/app/(workspace)/work-orders/page.tsx apps/web/src/components/WorkOrderWorkspace.tsx apps/web/src/app/globals.css packages/database/postgres/723_work_order_experience.sql tests/sprint723-work-order-experience.test.js SPRINT723_REQUIRED_WIRING.md PHASE46_RELEASE_NOTES.md GIT_COMMANDS_PHASE46.md package.json
git commit -m "Sprint 723: add work order experience"
git push origin codex/sprint-716-frontend-foundation
```

Sprint 724 continuation:

```powershell
npm run test:sprint724
npm run migrations:check
npm run web:typecheck
npm run web:build
npm run web:build:pages
npm test
git add -- apps/api/src/repositories/knowledgeArticleRepository.js apps/api/src/repositories/repositoryFactory.js apps/api/src/routes/knowledge.js apps/api/src/router.js apps/api/src/services/mediaService.js apps/api/src/auth/permissions.js apps/api/src/store/jsonStoreAdapter.js apps/web/src/app/(workspace)/knowledge/page.tsx apps/web/src/components/KnowledgeWorkspace.tsx apps/web/src/components/AppShell.tsx apps/web/src/app/globals.css apps/web/src/app/knowledge.css packages/database/postgres/724_knowledge_center.sql tests/sprint724-knowledge-center.test.js SPRINT724_REQUIRED_WIRING.md PHASE46_RELEASE_NOTES.md GIT_COMMANDS_PHASE46.md package.json
git commit -m "Sprint 724: add knowledge center"
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
