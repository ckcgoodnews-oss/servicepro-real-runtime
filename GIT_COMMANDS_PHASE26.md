# Phase 26 Git Commands

```powershell
$Repo = "I:\REPO\servicepro-cumulative"
$Zip  = "I:\REPO\servicepro-phase26-version4-foundation-rc.zip"
$Temp = "I:\REPO\phase26-extract"

Remove-Item $Temp -Recurse -Force -ErrorAction SilentlyContinue
Expand-Archive -Path $Zip -DestinationPath $Temp -Force
Set-Location $Repo
git switch main
git pull --ff-only origin main
git fetch "$Temp\servicepro-cumulative" phase-26-version4-foundation-rc
git switch -c phase-26-version4-foundation-rc FETCH_HEAD
npm install
npm test
npm run migrations:check
git push -u origin phase-26-version4-foundation-rc
git switch main
git merge --ff-only phase-26-version4-foundation-rc
git push origin main
git tag -a v4.0.0-rc1 -m "ServicePro Version 4 Foundation and Release Candidate"
git push origin v4.0.0-rc1
```
