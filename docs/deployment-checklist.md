# Deployment Checklist

## Before build

- Confirm `.env.production` exists in the deployment environment.
- Confirm `JWT_SECRET` and `PORTAL_TOKEN_SECRET` are unique and long.
- Confirm `DATABASE_URL` points to the production PostgreSQL database.
- Confirm `CORS_ALLOWED_ORIGINS` contains only trusted domains.
- Confirm `DATA_STORE=postgres`.

## Build

```powershell
docker build -t servicepro-api:0.71.0 .
```

## Run database migrations

```powershell
npm run migrate
```

## Smoke checks

```powershell
npm run config:check
npm run deploy:check
```

## Rollback

- Re-deploy the previous container tag.
- Restore database from latest verified backup if a migration rollback is required.
