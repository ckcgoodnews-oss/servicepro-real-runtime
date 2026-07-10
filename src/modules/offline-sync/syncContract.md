# Offline Sync Contract

## Server responsibilities

- Emit tenant-scoped changes into `sync_change_log`.
- Track per-device cursors in `offline_sync_cursors`.
- Return changes after the last cursor.
- Reject cross-tenant sync requests.
- Detect stale updates and return conflict responses.

## Client responsibilities

- Store last successful cursor.
- Send local mutations in timestamp order.
- Preserve server IDs after successful upsert.
- Retry failed batches safely.
