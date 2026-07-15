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
