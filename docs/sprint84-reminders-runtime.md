# Sprint 84 - Reminders Runtime

Apply this patch over Sprint 83.

## Endpoints to wire

```text
GET   /api/v1/reminder-rules
POST  /api/v1/reminder-rules

GET   /api/v1/follow-ups
POST  /api/v1/follow-ups
POST  /api/v1/follow-ups/timeline
POST  /api/v1/follow-ups/due
POST  /api/v1/follow-ups/overdue
GET   /api/v1/follow-ups/:id
PATCH /api/v1/follow-ups/:id
POST  /api/v1/follow-ups/:id/complete
POST  /api/v1/follow-ups/:id/snooze
```

## Seed

```powershell
npm run seed:reminders
```
