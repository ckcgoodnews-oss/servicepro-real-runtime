# Phase 20 Git Commands

```powershell
$Repo = "I:\REPO\servicepro-cumulative"
$Zip = "I:\REPO\servicepro-phase20-version3-foundation.zip"
Set-Location $Repo
git switch main
git pull --ff-only origin main
git switch -c phase-20-version3-foundation
Expand-Archive -Path $Zip -DestinationPath $Repo -Force
npm install
npm test
npm run migrations:check
git add .
git commit -m "Phase 20: Version 3 Foundation, Sprints 326-340"
git push -u origin phase-20-version3-foundation
```
