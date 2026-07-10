# Sprint 60 - PostgreSQL Price Book Finalization

Apply this patch over Sprint 59.

## What changed

- Estimates now resolve service-code lines in PostgreSQL mode.
- Invoices now resolve service-code lines in PostgreSQL mode.
- Invoice `recordPayment` works in PostgreSQL mode.
- Added async price-book line resolver.
- Added service seeding helper.
- Added PostgreSQL indexes and runtime check table.

## Commands

```powershell
npm install
npm test
```

PostgreSQL mode:

```powershell
$env:DATA_STORE="postgres"
npm run migrate
npm run seed:services
npm run dev
```
