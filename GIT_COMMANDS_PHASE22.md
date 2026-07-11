# Phase 22 Git Commands

```powershell
$Repo = "I:\REPO\servicepro-cumulative"
$Zip  = "I:\REPO\servicepro-phase22-service-intelligence-automation.zip"
$Temp = "I:\REPO\phase22-extract"

Remove-Item $Temp -Recurse -Force -ErrorAction SilentlyContinue
Expand-Archive -Path $Zip -DestinationPath $Temp -Force
Set-Location $Repo
git switch main
git pull --ff-only origin main
git fetch "$Temp\servicepro-cumulative" phase-22-service-intelligence-automation
git switch -c phase-22-service-intelligence-automation FETCH_HEAD
npm install
npm test
npm run migrations:check
git push -u origin phase-22-service-intelligence-automation
git switch main
git merge --ff-only phase-22-service-intelligence-automation
git push origin main
git tag -a v3.1.0 -m "ServicePro Service Intelligence Automation"
git push origin v3.1.0
```
