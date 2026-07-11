# Phase 25 Git Commands

```powershell
$Repo = "I:\REPO\servicepro-cumulative"
$Zip  = "I:\REPO\servicepro-phase25-enterprise-federation-ecosystem.zip"
$Temp = "I:\REPO\phase25-extract"

Remove-Item $Temp -Recurse -Force -ErrorAction SilentlyContinue
Expand-Archive -Path $Zip -DestinationPath $Temp -Force
Set-Location $Repo
git switch main
git pull --ff-only origin main
git fetch "$Temp\servicepro-cumulative" phase-25-enterprise-federation-ecosystem
git switch -c phase-25-enterprise-federation-ecosystem FETCH_HEAD
npm install
npm test
npm run migrations:check
git push -u origin phase-25-enterprise-federation-ecosystem
git switch main
git merge --ff-only phase-25-enterprise-federation-ecosystem
git push origin main
git tag -a v3.4.0 -m "ServicePro Enterprise Federation and Ecosystem"
git push origin v3.4.0
```
