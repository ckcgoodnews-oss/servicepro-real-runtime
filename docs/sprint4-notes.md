# Sprint 4 Notes — Customer Portal, Notifications, Printable Documents

## Added

- Customer portal access request page: `/portal/request`
- Magic-link customer portal: `/portal/:token`
- Customer detail page with portal link generation: `/admin/customers/:id`
- Notification queue: `/admin/notifications`
- Stub send action for queued messages
- Printable estimate route: `/admin/estimates/:id/print`
- Printable invoice route: `/admin/invoices/:id/print`
- Email queue actions for estimates and invoices
- PostgreSQL migration starter: `src/db/postgres/003_sprint4_customer_portal_notifications.sql`

## Important

Sprint 4 does not contact real SMTP, Twilio, or payment providers. It queues messages in `notification_queue` so the installer/developer can verify data safely before enabling external providers.

## Smoke test

1. Run setup and login as owner.
2. Open Customers and create or view a customer.
3. Generate a portal link.
4. Open Notifications and confirm an email queue row exists.
5. Copy the `/portal/...` token path from the customer detail page.
6. Open it while logged out or in a private browser window.
7. Create an estimate/invoice and test Print / Save PDF.
