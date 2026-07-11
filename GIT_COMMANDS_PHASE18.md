# Phase 18 Git Commands

```powershell
$Repo = "I:\REPO\servicepro-cumulative"
$Zip = "I:\REPO\servicepro-phase18-industry-solutions.zip"
Set-Location $Repo
git switch main
git pull --ff-only origin main
git switch -c phase-18-industry-solutions
Expand-Archive -Path $Zip -DestinationPath $Repo -Force
npm install
npm test
npm run migrations:check
git add .
git commit -m "Phase 18: Industry Solutions, Sprints 296-310"
git push -u origin phase-18-industry-solutions
```
