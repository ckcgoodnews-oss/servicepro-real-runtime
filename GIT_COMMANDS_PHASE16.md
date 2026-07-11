# Phase 16 Git Commands

```powershell
$Repo = "I:\REPO\servicepro-cumulative"
$Zip = "I:\REPO\servicepro-phase16-enterprise-intelligence.zip"
Set-Location $Repo
git switch main
git pull --ff-only origin main
git switch -c phase-16-enterprise-intelligence
Expand-Archive -Path $Zip -DestinationPath $Repo -Force
npm install
npm test
npm run migrations:check
git add .
git commit -m "Phase 16: Enterprise Intelligence, Sprints 266-280"
git push -u origin phase-16-enterprise-intelligence
```
