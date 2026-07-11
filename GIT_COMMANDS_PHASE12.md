# Git commands

```powershell
Set-Location "I:\REPO\servicepro-cumulative"
git switch main
git pull --ff-only origin main
git switch -c phase-12-marketplace
Expand-Archive "I:\REPO\servicepro-phase12-marketplace.zip" -DestinationPath . -Force
npm install
npm test
npm run migrations:check
git add .
git commit -m "Phase 12: Marketplace and Integration, Sprints 201-215"
git push -u origin phase-12-marketplace
```
