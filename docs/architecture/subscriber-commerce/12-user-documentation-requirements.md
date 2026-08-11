# 12 — User Documentation Requirements

## Principles

- Documentation must match **actual implemented UI** exactly
- Do not describe features that do not exist
- Do not invent screen labels or functionality
- Update documentation when UI changes
- Accessible from in-app help links

## Required HOW TO Guides

| Guide | Prerequisite Implementation |
|-------|----------------------------|
| Enable Customer Payments | P0-3 settings + P1-1 UI |
| Connect Stripe | P0-2 + P1-2 UI |
| Collect Invoice Payment | P1-3 |
| Send Payment Link | P1-4 |
| Refund Customer Payment | P0-7 + refund UI |
| Configure Partial Payments | P0-3 + P1-1 |
| Configure Deposits | P0-3 + P1-1 |
| Configure Automatic Receipts | P1-6 |
| Configure Customer Portal | Existing portal |
| Configure Estimates | Existing estimates |
| Configure Online Booking | Existing booking |
| Configure Customer Memberships | P2-1 (deferred) |
| Configure Communications | Existing + P1-6 |
| Configure Express Service | P1-7 |
| Run Test Customer Transaction | P1-9 |

## Express Service — Subscriber Admin Guide

1. Navigate to Settings → Customer Experience → Express Service
2. Toggle "Enable Express Service" ON
3. Select eligible services from your service catalog
4. Set service areas (optional — limits geographic availability)
5. Configure request requirements:
   - Require photos (ON/OFF)
   - Require description (ON by default)
6. Configure deposit:
   - Require deposit (ON/OFF)
   - Set deposit amount
   - (Requires Customer Payments enabled)
7. Configure payment on completion (ON/OFF)
8. Configure notifications:
   - Send email on new request
   - Send email on status change
9. Configure assignment:
   - Auto-assign to available technician, OR
   - Manual assignment from request queue
10. Save settings
11. Verify Express Service appears in customer portal
12. Monitor incoming requests in Express Service queue
13. Assign technician → converts to scheduled job
14. After job completion → create invoice
15. Collect payment (standard invoice payment flow)

## Express Service — Customer Guide

1. Log in to your service portal
2. Click "Request Service" or "Express Service"
3. Select the service you need from the list
4. Select your property/location (if applicable)
5. Describe the issue in detail
6. Upload photos of the problem (if required)
7. Select urgency level:
   - Normal — standard scheduling
   - Urgent — prioritized scheduling
   - Emergency — immediate response (if enabled)
8. Review and submit request
9. Pay deposit if required
10. Receive confirmation notification
11. Track your request status:
    - Submitted → Acknowledged → Assigned → Scheduled → In Progress → Completed
12. Receive invoice after work is completed
13. Pay invoice online (if online payments enabled)
14. Receive receipt

## Payment Collection — Admin Guide Structure

```
# Collect Invoice Payment

## Prerequisites
- Accept Customer Payments enabled (Settings → Billing → Customer Payments)
- Stripe account connected and active

## Steps
1. Open the invoice you want to collect payment for
2. Click "Collect Payment"
3. Verify the amount (pre-filled from invoice balance)
4. Enter customer's card details using the secure payment form
5. Click "Confirm Payment"
6. Wait for confirmation
7. Invoice status updates to "Paid" (or "Partially Paid")
8. Customer receives receipt (if automatic receipts enabled)

## Notes
- Payment amount cannot exceed invoice balance
- For partial payments, enter the amount to collect
- 3D Secure challenges will be handled automatically
```

## Documentation Location

```
apps/web/public/documentation/howto/
├── enable-customer-payments.md
├── connect-stripe.md
├── collect-invoice-payment.md
├── send-payment-link.md
├── refund-customer-payment.md
├── configure-partial-payments.md
├── configure-deposits.md
├── configure-automatic-receipts.md
├── configure-customer-portal.md
├── configure-estimates.md
├── configure-online-booking.md
├── configure-customer-memberships.md
├── configure-communications.md
├── configure-express-service.md
├── run-test-transaction.md
└── express-service-customer-guide.md
```
