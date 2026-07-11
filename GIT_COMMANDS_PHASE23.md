# Phase 23 Git Commands

```powershell
$Repo = "I:\REPO\servicepro-cumulative"
$Zip  = "I:\REPO\servicepro-phase23-customer-experience-field-mobility.zip"
$Temp = "I:\REPO\phase23-extract"

Remove-Item $Temp -Recurse -Force -ErrorAction SilentlyContinue
Expand-Archive -Path $Zip -DestinationPath $Temp -Force
Set-Location $Repo
git switch main
git pull --ff-only origin main
git fetch "$Temp\servicepro-cumulative" phase-23-customer-experience-field-mobility
git switch -c phase-23-customer-experience-field-mobility FETCH_HEAD
npm install
npm test
npm run migrations:check
git push -u origin phase-23-customer-experience-field-mobility
git switch main
git merge --ff-only phase-23-customer-experience-field-mobility
git push origin main
git tag -a v3.2.0 -m "ServicePro Customer Experience and Field Mobility"
git push origin v3.2.0
```
