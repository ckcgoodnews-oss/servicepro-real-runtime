# Phase 38 Git Commands

```powershell
$Repo = "I:\REPO\servicepro-cumulative"
$Zip = "I:\REPO\servicepro-phase38-version6-foundation-rc.zip"
$Temp = "I:\REPO\phase38-extract"
Remove-Item $Temp -Recurse -Force -ErrorAction SilentlyContinue
Expand-Archive -Path $Zip -DestinationPath $Temp -Force
Set-Location $Repo
git switch main
git pull --ff-only origin main
git fetch "$Temp\servicepro-cumulative" phase-38-version6-foundation-rc
git switch -c phase-38-version6-foundation-rc FETCH_HEAD
npm install
npm test
npm run migrations:check
git push -u origin phase-38-version6-foundation-rc
git switch main
git merge --ff-only phase-38-version6-foundation-rc
git push origin main
git tag -a v6.0.0-rc1 -m "ServicePro Phase 38 Version 6 Foundation and RC"
git push origin v6.0.0-rc1
```
