# Phase 39 Git Commands

```powershell
$Repo = "I:\REPO\servicepro-cumulative"
$Zip = "I:\REPO\servicepro-phase39-version6-ga.zip"
$Temp = "I:\REPO\phase39-extract"
Remove-Item $Temp -Recurse -Force -ErrorAction SilentlyContinue
Expand-Archive -Path $Zip -DestinationPath $Temp -Force
Set-Location $Repo
git switch main
git pull --ff-only origin main
git fetch "$Temp\servicepro-cumulative" phase-39-version6-ga
git switch -c phase-39-version6-ga FETCH_HEAD
npm install
npm test
npm run migrations:check
git push -u origin phase-39-version6-ga
git switch main
git merge --ff-only phase-39-version6-ga
git push origin main
git tag -a v6.0.0 -m "ServicePro Phase 39 Version 6 Stabilization and GA"
git push origin v6.0.0
```
