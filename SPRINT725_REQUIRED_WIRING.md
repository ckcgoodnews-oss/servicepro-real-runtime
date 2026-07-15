# Sprint 725 Required Wiring

- The protected `/notifications` workspace lists only the signed-in user’s tenant-scoped messages.
- Individual and bulk read actions preserve delivery status while recording `read_at`.
- Email, browser push, dispatch, billing, and product preferences persist through the existing user profile API.
- Browser push opt-in requests device permission before enabling the preference.
- Reusable accessible toast messages confirm inbox and preference actions.
- PostgreSQL deployments must apply `725_notification_center.sql` before enabling read-state actions.
