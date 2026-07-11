# Git commands

```powershell
Set-Location "I:\REPO\servicepro-cumulative"
git switch main
git pull --ff-only origin main
git switch -c phase-14-enterprise-production
Expand-Archive "I:\REPO\servicepro-phase14-enterprise-production.zip" -DestinationPath . -Force
npm install
npm test
npm run migrations:check
git add .
git commit -m "Phase 14: Enterprise Production, Sprints 231-250"
git push -u origin phase-14-enterprise-production
```
