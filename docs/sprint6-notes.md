# Sprint 6 Notes

Sprint 6 adds operational controls for running ServicePro as a tenant-safe SaaS platform.

## Features

- Audit viewer for owner/manager/installer roles.
- Tenant backup generation into `data/backups`.
- Live tenant JSON export download.
- Tenant import/restore UI with merge and replace modes.
- Health dashboard and CLI health script.
- Public health endpoints for uptime checks.

## Safety model

All backup/export/import actions are scoped to the signed-in user's `tenant_id`. Platform-level users can view audit logs across tenants, but tenant users only see their own events.

## Recommended use

Before importing a replacement tenant export, create a backup first from `/admin/backups`.
