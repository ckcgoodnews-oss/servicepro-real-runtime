# Git commands

```powershell
Set-Location "I:\REPO\servicepro-cumulative"
git switch main
git pull --ff-only origin main
git switch -c phase-11-platform-operations
Expand-Archive "I:\REPO\servicepro-phase11-platform-operations.zip" -DestinationPath . -Force
npm install
npm test
npm run migrations:check
git add .
git commit -m "Phase 11: Platform Operations, Sprints 186-200"
git push -u origin phase-11-platform-operations
```
