# Sprint 71 - Deployment Runtime

Apply this patch over Sprint 70.

## Local Docker deployment

```powershell
docker compose up -d --build
docker compose exec api npm run migrate
docker compose exec api npm run seed:auth
docker compose exec api npm run seed:services
```

Check the API:

```powershell
Invoke-RestMethod http://localhost:3000/healthz
Invoke-RestMethod http://localhost:3000/readyz
```

## Production configuration

Use `.env.production.example` as a starting point.

Required production settings:

```text
NODE_ENV=production
DATA_STORE=postgres
DATABASE_URL=...
JWT_SECRET=64+ random characters recommended
PORTAL_TOKEN_SECRET=64+ random characters recommended
CORS_ALLOWED_ORIGINS=https://your-real-domain
```

## Pre-deployment validation

```powershell
npm run config:check
npm run migrate
npm test
```

## Container health

The Dockerfile includes a healthcheck that calls:

```text
node scripts/deployment-check.js
```
