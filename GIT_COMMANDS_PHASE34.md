# Phase 34 Git Commands

```powershell
$Repo = "I:\REPO\servicepro-cumulative"
$Zip = "I:\REPO\servicepro-phase34-version5-post-ga-assurance.zip"
$Temp = "I:\REPO\phase34-extract"
Remove-Item $Temp -Recurse -Force -ErrorAction SilentlyContinue
Expand-Archive -Path $Zip -DestinationPath $Temp -Force
Set-Location $Repo
git switch main
git pull --ff-only origin main
git fetch "$Temp\servicepro-cumulative" phase-34-version5-post-ga-assurance
git switch -c phase-34-version5-post-ga-assurance FETCH_HEAD
npm install
npm test
npm run migrations:check
git push -u origin phase-34-version5-post-ga-assurance
git switch main
git merge --ff-only phase-34-version5-post-ga-assurance
git push origin main
git tag -a v5.0.1 -m "ServicePro Phase 34 Version 5 Post-GA Assurance"
git push origin v5.0.1
```
