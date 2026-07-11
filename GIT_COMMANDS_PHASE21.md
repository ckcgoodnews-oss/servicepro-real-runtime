# Phase 21 Git Commands

```powershell
$Repo = "I:\REPO\servicepro-cumulative"
$Zip = "I:\REPO\servicepro-phase21-version3-ga.zip"
Set-Location $Repo
git switch main
git pull --ff-only origin main
git switch -c phase-21-version3-ga
Expand-Archive -Path $Zip -DestinationPath $Repo -Force
npm install
npm test
npm run migrations:check
git add .
git commit -m "Phase 21: Version 3 GA, Sprints 341-355"
git push -u origin phase-21-version3-ga
git switch main
git merge --ff-only phase-21-version3-ga
git push origin main
git tag -a v3.0.0 -m "ServicePro Version 3.0 General Availability"
git push origin v3.0.0
```
