# Work Management Platform Architecture

## Overview

ServicePRO's work management layer provides monday.com-class configurable boards that integrate with the field service operational system. Boards serve as a flexible project/task tracking layer that complements the structured work order and dispatch systems.

## Data Model

### Hierarchy
```
Board → Groups → Items → Subitems
                    ↓
              Column Values
```

### Column Types Supported
| Type | Description | Settings |
|------|-------------|----------|
| status | Color-coded status labels | labels: [{value, label, color}] |
| priority | Priority indicator | labels: [{value, label, color}] |
| person | User assignment | Multi-select user list |
| date | Single date | - |
| timeline | Date range | start, end |
| number | Numeric value | unit, format |
| text | Free text | max_length |
| checkbox | Boolean | - |
| dropdown | Select from options | options list |
| formula | Computed value | expression |

### Views
Each board can have multiple views showing the same data differently:
- **Table** — Spreadsheet-style grid (default)
- **Kanban** — Cards grouped by a status/priority column
- **Calendar** — Items plotted by date column
- **Timeline** — Gantt-style horizontal bars by date range
- **Chart** — Aggregated visualizations
- **Form** — External submission form

Views share the same underlying items — no data duplication.

## API Endpoints

### Boards
- `GET /api/v1/boards` — List boards
- `POST /api/v1/boards` — Create board
- `GET /api/v1/boards/:id` — Get board with columns
- `PATCH /api/v1/boards/:id` — Update board (name, columns, settings)
- `DELETE /api/v1/boards/:id` — Delete board (cascades to groups/items/views)

### Groups
- `GET /api/v1/boards/:boardId/groups` — List groups
- `POST /api/v1/boards/:boardId/groups` — Create group
- `PATCH /api/v1/boards/groups/:groupId` — Update group
- `DELETE /api/v1/boards/groups/:groupId` — Delete group

### Items
- `GET /api/v1/boards/:boardId/items` — List items (top-level)
- `POST /api/v1/boards/:boardId/items` — Create item
- `GET /api/v1/boards/items/:itemId` — Get item
- `PATCH /api/v1/boards/items/:itemId` — Update item (column values merge)
- `DELETE /api/v1/boards/items/:itemId` — Delete item + subitems
- `GET /api/v1/boards/items/:itemId/subitems` — List subitems

### Views
- `GET /api/v1/boards/:boardId/views` — List views
- `POST /api/v1/boards/:boardId/views` — Create view
- `PATCH /api/v1/boards/views/:viewId` — Update view settings
- `DELETE /api/v1/boards/views/:viewId` — Delete view

### Templates
- `GET /api/v1/boards/templates` — List available templates
- `POST /api/v1/boards/templates` — Create template from board

## Column Value Semantics

Column values are stored as a JSONB object on each item:
```json
{
  "status": "working",
  "person": "alice",
  "date": "2026-08-10",
  "priority": "high",
  "effort": 8
}
```

Updates use **merge semantics** — only specified keys are updated, unspecified values are preserved.

## Permissions

| Permission | Scope |
|-----------|-------|
| `boards.read` | View boards, groups, items, views, templates |
| `boards.write` | Create/update boards, groups, items, views |
| `boards.delete` | Delete boards, items |

## Integration Points

- Board items can link to work orders, deals, tickets via the record association system
- Automation triggers can fire when item column values change
- Dashboard widgets can query board data for cross-module reporting
