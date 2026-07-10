# Sprint 151 Git Commands

Run from the root of your Sprint 150 repository after applying the patch.

```powershell
git status
git checkout -b sprint-151-privacy-dsar-ops

Expand-Archive .\servicepro-sprint151-privacy-dsar-ops-patch.zip -DestinationPath . -Force

npm install
npm test
npm run migrations:check

git add .
git commit -m "Sprint 151: add privacy DSAR operations runtime"
git status
```

Optional seed validation:

```powershell
npm run seed:privacy
```

Optional tag:

```powershell
git tag v1.51.0
```

Push:

```powershell
git push -u origin sprint-151-privacy-dsar-ops
git push origin v1.51.0
```
