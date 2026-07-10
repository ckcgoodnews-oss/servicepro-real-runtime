# Sprint 64 - Notifications Runtime

Apply this patch over Sprint 63.

## What changed

- Added message templates.
- Added notification queue.
- Added template rendering.
- Added notification process script.
- Added notification RBAC permissions.
- Added JSON and PostgreSQL repositories.

## Endpoints

```text
GET  /api/v1/notifications/templates
POST /api/v1/notifications/templates
GET  /api/v1/notifications
POST /api/v1/notifications
POST /api/v1/notifications/process
```

## Example queue body

```json
{
  "templateKey": "booking_requested",
  "toAddress": "customer@example.com",
  "toName": "Maria Johnson",
  "data": {
    "customerName": "Maria",
    "serviceType": "Drain cleaning",
    "requestedDate": "2026-07-10"
  }
}
```

Process queued notifications:

```powershell
npm run notifications:process
```
