# Phase 35 Git Commands

```powershell
$Repo = "I:\REPO\servicepro-cumulative"
$Zip = "I:\REPO\servicepro-phase35-agentic-workforce-orchestration.zip"
$Temp = "I:\REPO\phase35-extract"
Remove-Item $Temp -Recurse -Force -ErrorAction SilentlyContinue
Expand-Archive -Path $Zip -DestinationPath $Temp -Force
Set-Location $Repo
git switch main
git pull --ff-only origin main
git fetch "$Temp\servicepro-cumulative" phase-35-agentic-workforce-orchestration
git switch -c phase-35-agentic-workforce-orchestration FETCH_HEAD
npm install
npm test
npm run migrations:check
git push -u origin phase-35-agentic-workforce-orchestration
git switch main
git merge --ff-only phase-35-agentic-workforce-orchestration
git push origin main
git tag -a v5.1.0 -m "ServicePro Phase 35 Agentic Workforce Orchestration"
git push origin v5.1.0
```
