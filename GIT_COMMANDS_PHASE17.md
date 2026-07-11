# Phase 17 Git Commands

```powershell
$Repo = "I:\REPO\servicepro-cumulative"
$Zip = "I:\REPO\servicepro-phase17-global-scale.zip"
Set-Location $Repo
git switch main
git pull --ff-only origin main
git switch -c phase-17-global-scale
Expand-Archive -Path $Zip -DestinationPath $Repo -Force
npm install
npm test
npm run migrations:check
git add .
git commit -m "Phase 17: Global Scale, Sprints 281-295"
git push -u origin phase-17-global-scale
```
