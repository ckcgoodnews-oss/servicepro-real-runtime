# Phase 37 Git Commands

```powershell
$Repo = "I:\REPO\servicepro-cumulative"
$Zip = "I:\REPO\servicepro-phase37-sustainability-circular-operations.zip"
$Temp = "I:\REPO\phase37-extract"
Remove-Item $Temp -Recurse -Force -ErrorAction SilentlyContinue
Expand-Archive -Path $Zip -DestinationPath $Temp -Force
Set-Location $Repo
git switch main
git pull --ff-only origin main
git fetch "$Temp\servicepro-cumulative" phase-37-sustainability-circular-operations
git switch -c phase-37-sustainability-circular-operations FETCH_HEAD
npm install
npm test
npm run migrations:check
git push -u origin phase-37-sustainability-circular-operations
git switch main
git merge --ff-only phase-37-sustainability-circular-operations
git push origin main
git tag -a v5.3.0 -m "ServicePro Phase 37 Sustainability Circular Operations"
git push origin v5.3.0
```
