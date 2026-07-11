# Phase 27 Git Commands

```powershell
$Repo = "I:\REPO\servicepro-cumulative"
$Zip  = "I:\REPO\servicepro-phase27-version4-ga.zip"
$Temp = "I:\REPO\phase27-extract"

Remove-Item $Temp -Recurse -Force -ErrorAction SilentlyContinue
Expand-Archive -Path $Zip -DestinationPath $Temp -Force
Set-Location $Repo
git switch main
git pull --ff-only origin main
git fetch "$Temp\servicepro-cumulative" phase-27-version4-ga
git switch -c phase-27-version4-ga FETCH_HEAD
npm install
npm test
npm run migrations:check
git push -u origin phase-27-version4-ga
git switch main
git merge --ff-only phase-27-version4-ga
git push origin main
git tag -a v4.0.0 -m "ServicePro Version 4 Stabilization and General Availability"
git push origin v4.0.0
```
