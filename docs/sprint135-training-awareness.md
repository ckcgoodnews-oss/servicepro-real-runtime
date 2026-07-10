# Sprint 135 - Training and Awareness

Apply this patch over Sprint 134.

## Endpoints to wire

```text
GET  /api/v1/training-awareness/courses
POST /api/v1/training-awareness/courses
GET  /api/v1/training-awareness/campaigns
POST /api/v1/training-awareness/campaigns
POST /api/v1/training-awareness/campaigns/:id/schedule
POST /api/v1/training-awareness/campaigns/:id/activate
GET  /api/v1/training-awareness/assignments
POST /api/v1/training-awareness/assignments
POST /api/v1/training-awareness/assignments/:id/start
POST /api/v1/training-awareness/assignments/:id/evidence
POST /api/v1/training-awareness/assignments/:id/complete
POST /api/v1/training-awareness/assignments/mark-overdue
POST /api/v1/training-awareness/assignments/:id/reminders
POST /api/v1/training-awareness/reminders/:id/send
POST /api/v1/training-awareness/reminders/:id/fail
POST /api/v1/training-awareness/assignments/:id/exceptions
POST /api/v1/training-awareness/exceptions/:id/approve
POST /api/v1/training-awareness/exceptions/:id/reject
GET  /api/v1/training-awareness/metrics
```

## Seed

```powershell
npm run seed:training-awareness
```
