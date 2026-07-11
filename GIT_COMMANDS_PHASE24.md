# Phase 24 Git Commands

```powershell
$Repo = "I:\REPO\servicepro-cumulative"
$Zip  = "I:\REPO\servicepro-phase24-financial-growth-operations.zip"
$Temp = "I:\REPO\phase24-extract"

Remove-Item $Temp -Recurse -Force -ErrorAction SilentlyContinue
Expand-Archive -Path $Zip -DestinationPath $Temp -Force
Set-Location $Repo
git switch main
git pull --ff-only origin main
git fetch "$Temp\servicepro-cumulative" phase-24-financial-growth-operations
git switch -c phase-24-financial-growth-operations FETCH_HEAD
npm install
npm test
npm run migrations:check
git push -u origin phase-24-financial-growth-operations
git switch main
git merge --ff-only phase-24-financial-growth-operations
git push origin main
git tag -a v3.3.0 -m "ServicePro Financial and Growth Operations"
git push origin v3.3.0
```
