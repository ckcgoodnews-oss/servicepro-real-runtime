# Release Checklist

## Before tagging

```powershell
npm install
npm run migrations:check
npm test
npm run config:check
docker build -t servicepro-api:<version> .
```

## Tag

```powershell
git tag v0.72.0
git push origin v0.72.0
```

## Deployment

```powershell
docker compose up -d --build
docker compose exec api npm run migrate
docker compose exec api npm run seed:services
```

## Post-deployment checks

```powershell
Invoke-RestMethod https://your-domain/healthz
Invoke-RestMethod https://your-domain/readyz
```

## Rollback

- Re-deploy the previous image tag.
- Restore database backup only if the release included destructive migration behavior.
- Preserve logs and audit events for diagnosis.
