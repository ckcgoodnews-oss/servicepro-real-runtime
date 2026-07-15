# Git Commands - Phase 47

```powershell
cd I:\REPO\servicepro-cumulative

git status --short
npm run web:typecheck
node tests/sprint717-web-identity-integration.test.js
npm run web:build
npm run web:build:pages

git add -- apps/web tests/sprint717-web-identity-integration.test.js PHASE47_RELEASE_NOTES.md SPRINT717_REQUIRED_WIRING.md GIT_COMMANDS_PHASE47.md package.json
git commit -m "Sprint 717A: integrate web identity flows"
git push origin codex/sprint-716-frontend-foundation
```

Keep `.env.render` untracked and out of the commit.
