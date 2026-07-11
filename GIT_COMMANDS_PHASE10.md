# Git commands

```powershell
Set-Location "I:\REPO\servicepro-cumulative"
git switch main
git pull --ff-only origin main
git switch -c phase-10-ai-platform
Expand-Archive "I:\REPO\servicepro-phase10-ai-platform.zip" -DestinationPath . -Force
npm install
npm test
npm run migrations:check
git add .
git commit -m "Phase 10: AI Platform, Sprints 171-185"
git push -u origin phase-10-ai-platform
```
