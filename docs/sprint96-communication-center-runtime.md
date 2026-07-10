# Sprint 96 - Customer Communication Center 2.0 Runtime

Apply this patch over Sprint 95.

## Endpoints to wire

```text
GET   /api/v1/communication-center/threads
POST  /api/v1/communication-center/threads
GET   /api/v1/communication-center/threads/:id
PATCH /api/v1/communication-center/threads/:id

GET   /api/v1/communication-center/threads/:id/messages
POST  /api/v1/communication-center/threads/:id/messages

POST  /api/v1/communication-center/threads/:id/assign
POST  /api/v1/communication-center/threads/:id/mark-read
POST  /api/v1/communication-center/threads/:id/resolve
POST  /api/v1/communication-center/summary
```

## Seed

```powershell
npm run seed:communication-center
```
