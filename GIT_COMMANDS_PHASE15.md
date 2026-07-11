# Phase 15 Git Commands

```powershell
$Repo = "I:\REPO\servicepro-cumulative"
$Zip = "I:\REPO\servicepro-phase15-post-ga-lts.zip"
Set-Location $Repo
git switch main
git pull --ff-only origin main
git switch -c phase-15-post-ga-lts
Expand-Archive -Path $Zip -DestinationPath $Repo -Force
npm install
npm test
npm run migrations:check
git add .
git commit -m "Phase 15: Post-GA LTS, Sprints 251-265"
git push -u origin phase-15-post-ga-lts
```
