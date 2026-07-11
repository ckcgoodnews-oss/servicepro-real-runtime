# Phase 19 Git Commands

```powershell
$Repo = "I:\REPO\servicepro-cumulative"
$Zip = "I:\REPO\servicepro-phase19-platform-extensibility.zip"
Set-Location $Repo
git switch main
git pull --ff-only origin main
git switch -c phase-19-platform-extensibility
Expand-Archive -Path $Zip -DestinationPath $Repo -Force
npm install
npm test
npm run migrations:check
git add .
git commit -m "Phase 19: Platform Extensibility, Sprints 311-325"
git push -u origin phase-19-platform-extensibility
```
