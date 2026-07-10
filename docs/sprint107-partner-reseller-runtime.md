# Sprint 107 - Partner and Reseller Runtime

Apply this patch over Sprint 106.

## Endpoints to wire

```text
GET  /api/v1/partners
POST /api/v1/partners
GET  /api/v1/partners/reseller-tenants
POST /api/v1/partners/reseller-tenants
GET  /api/v1/partners/referrals
POST /api/v1/partners/referrals
POST /api/v1/partners/referrals/:id/accept
POST /api/v1/partners/referrals/:id/won
GET  /api/v1/partners/commission-rules
POST /api/v1/partners/commission-rules
GET  /api/v1/partners/commissions
POST /api/v1/partners/commissions
POST /api/v1/partners/commissions/:id/approve
POST /api/v1/partners/payouts
POST /api/v1/partners/payouts/:id/approve
POST /api/v1/partners/payouts/:id/pay
GET  /api/v1/partners/:id/performance
```

## Seed

```powershell
npm run seed:partners
```
