# Git commands

```powershell
Set-Location "I:\REPO\servicepro-cumulative"
git switch main
git pull --ff-only origin main
git switch -c phase-13-enterprise-analytics
Expand-Archive "I:\REPO\servicepro-phase13-enterprise-analytics.zip" -DestinationPath . -Force
npm install
npm test
npm run migrations:check
git add .
git commit -m "Phase 13: Enterprise Analytics, Sprints 216-230"
git push -u origin phase-13-enterprise-analytics
```
