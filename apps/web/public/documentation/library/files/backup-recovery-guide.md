---
title: "Backup and Recovery Guide"
subtitle: "JSON mode backup"
document_type: "Operations and reference"
audience:
  - Business leaders
  - Platform administrators
  - Buyers and evaluators
  - Partners and technical stakeholders
status: "Publication edition"
published: "2026-08-03"
source_of_truth: "ServicePro repository"
---

# Backup and Recovery Guide

> **Operations and reference**
> JSON mode backup

## Document Control

| Field | Detail |
|---|---|
| Purpose | Enterprise platform overview and buyer evaluation reference |
| Audience | Business leaders, platform administrators, evaluators, partners, and technical stakeholders |
| Scope | Capabilities, architecture, security, deployment, adoption, outcomes, and terminology |
| Source | ServicePro repository documentation; technical meaning preserved |

> [!NOTE]
> This publication edition improves navigation, document metadata, and cross-format consistency. Product and technical claims remain those of the source document.

## JSON mode backup

```powershell
$env:DATA_FILE="./data/servicepro-runtime.json"
$env:BACKUP_DIR="./backups"
npm run backup:json
```

This creates:

```text
backups/servicepro-json-<timestamp>.json
backups/servicepro-json-<timestamp>.json.manifest.json
```

## Validate a JSON restore file

```powershell
node scripts/validate-restore-file.js .\backups\servicepro-json-<timestamp>.json
```

## PostgreSQL backup

Generate the command:

```powershell
$env:DATABASE_URL="postgresql://servicepro:password@host:5432/servicepro"
npm run backup:postgres:command
```

Run the printed `pg_dump` command on a machine with PostgreSQL client tools installed.

## PostgreSQL restore

Use the printed `pg_restore` command. Restore into a staging database first.

## Retention

Recommended minimum:

```text
Hourly backups retained for 48 hours
Daily backups retained for 30 days
Monthly backups retained for 12 months
```

Generate a local retention report:

```powershell
node scripts/backup-retention-report.js
```

## Recovery drill

At least once per month:

1. Restore latest backup into staging.
2. Run migrations.
3. Run `npm run config:check`.
4. Run `npm test`.
5. Smoke-test `/healthz` and `/readyz`.
