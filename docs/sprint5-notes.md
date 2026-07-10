# Sprint 5 Notes

Adds production-oriented platform features without breaking local development:

- Storage provider service layer
- Local upload mode remains default
- S3-compatible staged mode via `STORAGE_MODE=s3`
- Tenant billing/subscription tables
- Plan usage tracking
- Stripe Checkout stub events
- Tenant custom domain settings
- Domain resolution middleware
- Production hardening checklist

## New Admin Screens

- `/admin/storage`
- `/admin/billing`
- `/admin/domains`
- `/admin/production`

## Notes

S3 and Stripe are staged safely in this sprint. No real cloud calls are required for `npm install`, `npm run setup`, or `npm run dev`. Sprint 6 should replace the S3 stub with a real SDK `PutObjectCommand` and add Stripe webhook processing.
