# Schema Organization

Recommended organization:

```text
schema/
  001-core-tenants.sql
  010-auth.sql
  020-crm.sql
  030-jobs.sql
  040-estimates-invoices.sql
  050-inventory.sql
  060-mobile.sql
  070-ai.sql
  080-ops.sql
```

Every tenant-owned table must include `tenant_id`.
