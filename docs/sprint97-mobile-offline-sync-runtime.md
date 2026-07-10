# Sprint 97 - Technician Mobile Offline Sync Runtime

Apply this patch over Sprint 96.

## Endpoints to wire

```text
GET  /api/v1/mobile-sync/devices
POST /api/v1/mobile-sync/devices
POST /api/v1/mobile-sync/devices/:id/heartbeat

GET  /api/v1/mobile-sync/devices/:deviceId/cursor
POST /api/v1/mobile-sync/push
POST /api/v1/mobile-sync/pull

GET  /api/v1/mobile-sync/changes
POST /api/v1/mobile-sync/changes/:id/resolve
```

## Seed

```powershell
npm run seed:mobile-sync
```
