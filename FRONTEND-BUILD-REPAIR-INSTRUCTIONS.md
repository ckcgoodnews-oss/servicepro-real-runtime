# Frontend build repair

Run from Windows PowerShell:

```powershell
Set-Location I:\REPO\servicepro-cumulative
Set-ExecutionPolicy -Scope Process Bypass -Force
.\REPAIR-FRONTEND-BUILD.ps1
```

The repair deliberately installs development dependencies before setting
`NODE_ENV=production`. The React declaration packages and TypeScript are web
`devDependencies`; setting production mode before `npm ci` causes npm to omit
those packages and produces the `JSX.IntrinsicElements` and missing React
declaration errors.

Do not run `npm audit fix --force`. That can introduce breaking dependency
changes. Record the audit separately after the build passes.
