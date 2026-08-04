# Unified Customer & Operational Record Architecture

## Overview

ServicePRO implements a unified record graph that connects all business entities through a universal association system. This enables HubSpot-class relationship visibility while maintaining ServicePRO's field-service depth.

## Record Graph

```
Lead → Contact → Company → Property → Equipment
  ↓        ↓         ↓         ↓          ↓
Deal  ← Opportunity  │    Work Order ← Service Agreement
  ↓                  │         ↓
Quote/Estimate       │    Dispatch → Technician
  ↓                  │         ↓
Project              │    Completion → Invoice → Payment
  ↓                  │
Ticket               └── Campaign → Marketing Activity
```

## Core Tables

### record_associations
Universal many-to-many association table connecting any two records.

| Column | Type | Purpose |
|--------|------|---------|
| source_type | TEXT | Entity type (contact, deal, job, etc.) |
| source_id | UUID | Source entity ID |
| target_type | TEXT | Target entity type |
| target_id | UUID | Target entity ID |
| association_type | TEXT | 'related', 'primary', 'parent', 'child' |
| label | TEXT | Optional custom label |
| is_primary | BOOLEAN | Primary association flag |
| tenant_id | TEXT | Tenant isolation |

### activity_timeline
Unified activity feed for all record types.

| Column | Type | Purpose |
|--------|------|---------|
| entity_type | TEXT | Which entity this activity is on |
| entity_id | UUID | Entity ID |
| activity_type | TEXT | note, email, call, task, meeting, status_change, etc. |
| title | TEXT | Activity summary |
| description | TEXT | Details |
| performed_by | TEXT | User who performed |
| performed_at | TIMESTAMPTZ | When it happened |

## API Endpoints

### Record Associations
- `GET /api/v1/associations?entity_type=deal&entity_id=xxx` — List all associations for an entity
- `POST /api/v1/associations` — Create an association
- `DELETE /api/v1/associations/:id` — Remove an association

### Activity Timeline
- `GET /api/v1/activity?entity_type=deal&entity_id=xxx` — Get activity for an entity
- `POST /api/v1/activity` — Log a new activity
- `GET /api/v1/activity/recent` — Recent activity across tenant

### Deals
- `GET /api/v1/deals` — List deals (filter by pipeline, stage, status, owner)
- `POST /api/v1/deals` — Create a deal
- `GET /api/v1/deals/:id` — Get deal detail
- `PATCH /api/v1/deals/:id` — Update a deal
- `DELETE /api/v1/deals/:id` — Delete a deal
- `GET /api/v1/deals/forecast` — Pipeline forecast summary
- `GET /api/v1/deals/pipelines` — List pipelines
- `POST /api/v1/deals/pipelines` — Create a pipeline
- `GET /api/v1/deals/:id/products` — Deal line items
- `POST /api/v1/deals/:id/products` — Add product to deal

### CRM Contacts
- `GET /api/v1/crm/contacts` — List contacts
- `POST /api/v1/crm/contacts` — Create contact (with duplicate detection)
- `GET /api/v1/crm/contacts/:id` — Get contact
- `PATCH /api/v1/crm/contacts/:id` — Update contact
- `DELETE /api/v1/crm/contacts/:id` — Delete contact
- `GET /api/v1/crm/contacts/count` — Count by filters

### Tasks
- `GET /api/v1/tasks` — List tasks (filter by status, assignee, entity)
- `POST /api/v1/tasks` — Create task
- `GET /api/v1/tasks/:id` — Get task
- `PATCH /api/v1/tasks/:id` — Update task
- `DELETE /api/v1/tasks/:id` — Delete task
- `GET /api/v1/tasks/overdue` — Overdue tasks
- `GET /api/v1/tasks/counts` — Count by status

### CRM Properties
- `GET /api/v1/crm/properties?object_type=contact` — List property definitions
- `POST /api/v1/crm/properties` — Create property definition
- `GET /api/v1/crm/properties/:id` — Get property definition
- `PATCH /api/v1/crm/properties/:id` — Update property definition
- `DELETE /api/v1/crm/properties/:id` — Delete property definition

## Permissions

| Permission | Scope |
|-----------|-------|
| `deals.read` | View deals, pipelines, forecast |
| `deals.write` | Create/update deals, manage pipelines and products |
| `deals.delete` | Delete deals |
| `tasks.read` | View tasks, counts, overdue |
| `tasks.write` | Create/update tasks |
| `tasks.delete` | Delete tasks |
| `crm.read` | View contacts, associations, activity, properties |
| `crm.write` | Create/update contacts, associations, activity, properties |

## Tenant Isolation

All queries are scoped by `tenant_id`. The association system never crosses tenant boundaries. Indexes include tenant_id as the leading column for efficient partition pruning.

## Migration

Migration `776_unified_record_associations.sql` creates all tables with:
- UUID primary keys (gen_random_uuid)
- tenant_id on all tables
- Composite unique constraints preventing duplicate associations
- Check constraints on enum columns
- Indexed for common query patterns
