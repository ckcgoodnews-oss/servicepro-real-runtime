# Phase 36 Git Commands

```powershell
$Repo = "I:\REPO\servicepro-cumulative"
$Zip = "I:\REPO\servicepro-phase36-spatial-robotics-operations.zip"
$Temp = "I:\REPO\phase36-extract"
Remove-Item $Temp -Recurse -Force -ErrorAction SilentlyContinue
Expand-Archive -Path $Zip -DestinationPath $Temp -Force
Set-Location $Repo
git switch main
git pull --ff-only origin main
git fetch "$Temp\servicepro-cumulative" phase-36-spatial-robotics-operations
git switch -c phase-36-spatial-robotics-operations FETCH_HEAD
npm install
npm test
npm run migrations:check
git push -u origin phase-36-spatial-robotics-operations
git switch main
git merge --ff-only phase-36-spatial-robotics-operations
git push origin main
git tag -a v5.2.0 -m "ServicePro Phase 36 Spatial Robotics Operations"
git push origin v5.2.0
```
