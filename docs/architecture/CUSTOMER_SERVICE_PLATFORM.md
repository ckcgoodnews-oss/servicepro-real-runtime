# Customer Service Platform Architecture

## Overview

ServicePRO's customer service hub provides a HubSpot Service Hub-class ticketing system integrated with field service operations. Tickets connect to customers, equipment, properties, and work orders, enabling seamless escalation from support request to field dispatch.

## Data Model

### Tickets
Primary support record tracking customer issues from creation through resolution.

**Key Fields:**
- subject, description, status, priority (low/medium/high/urgent)
- category, channel (portal/email/phone/chat/form/api)
- customer_id, contact_id, company_id, equipment_id, property_id
- work_order_id (link to field service when dispatch needed)
- assigned_to (agent), assigned_team
- sla_policy_id, sla_breach_at
- first_response_at, resolved_at, closed_at
- satisfaction_score (1-5), resolution_notes, root_cause

### Ticket Pipelines
Configurable status workflows per support type.

**Default Statuses:**
1. New (open)
2. In Progress (open)
3. Waiting on Customer (pending)
4. Resolved (closed)
5. Closed (closed)

Status categories (open/pending/closed) drive SLA timers and reporting.

### SLA Policies
Service level targets by priority with business hours awareness.

**Structure:**
```json
{
  "priority_targets": {
    "urgent": { "first_response_minutes": 15, "resolution_minutes": 240 },
    "high": { "first_response_minutes": 60, "resolution_minutes": 480 },
    "medium": { "first_response_minutes": 240, "resolution_minutes": 1440 },
    "low": { "first_response_minutes": 480, "resolution_minutes": 2880 }
  },
  "business_hours": {
    "monday": { "start": "09:00", "end": "17:00" },
    ...
  }
}
```

### Ticket Comments
Threaded conversation on tickets supporting agent replies, customer messages, and internal notes.
- `author_type`: agent | customer | system
- `is_internal`: true for notes not visible to customers in the portal

## API Endpoints

### Tickets
- `GET /api/v1/tickets` — List (filter by status, priority, assignee, customer, category, channel)
- `POST /api/v1/tickets` — Create
- `GET /api/v1/tickets/:id` — Get detail
- `PATCH /api/v1/tickets/:id` — Update
- `DELETE /api/v1/tickets/:id` — Delete
- `GET /api/v1/tickets/metrics` — Aggregate metrics (counts by status/priority, avg satisfaction)

### Comments
- `GET /api/v1/tickets/:id/comments` — List comments
- `POST /api/v1/tickets/:id/comments` — Add comment (auto-records first response for agent replies)

### Configuration
- `GET /api/v1/tickets/pipelines` — List ticket pipelines
- `POST /api/v1/tickets/pipelines` — Create pipeline
- `GET /api/v1/tickets/sla-policies` — List SLA policies
- `POST /api/v1/tickets/sla-policies` — Create SLA policy

## Service Desk → Field Service Escalation

```
Ticket (support issue)
  ↓ needs field visit
Work Order (dispatched job)
  ↓ completed
Invoice → Payment
  ↓
Ticket resolved with work_order_id linked
```

The `work_order_id` field on tickets enables tracking which field service job resolved the support issue. The record association system provides the reverse link.

## First Response Tracking

When the first agent comment is added to a ticket, `first_response_at` is automatically recorded. This enables SLA compliance measurement:
- First response time = `first_response_at` - `created_at`
- Resolution time = `resolved_at` - `created_at`

## Permissions

| Permission | Scope |
|-----------|-------|
| `tickets.read` | View tickets, comments, metrics, pipelines, SLA policies |
| `tickets.write` | Create/update tickets, add comments, manage pipelines and SLAs |
| `tickets.delete` | Delete tickets |

## Customer Portal Integration

The existing customer portal (`/portal/api/`) can be extended to expose:
- Ticket submission (channel: 'portal')
- Ticket status viewing (filtered to customer's own tickets)
- Comment addition (author_type: 'customer')
- Public comments only (is_internal filtered out)
