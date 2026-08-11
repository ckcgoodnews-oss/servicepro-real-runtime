# 09 — Express Service Integration

## Canonical Name

**"Express Service"** — No existing implementation found in repository. No naming conflicts.

## Feature Definition

Express Service allows a subscriber's customers to request on-demand service through the portal or storefront with streamlined intake, optional deposit collection, and full lifecycle tracking.

## Integration Map

| System | Integration |
|--------|-------------|
| Subscriber settings | `express_service_settings` table |
| Customer portal | `POST /portal/api/express-service` |
| Public storefront | Optional Express Service widget |
| Payment (Stripe Connect) | Deposit + final payment via connected account |
| Job system | Converts to job when assigned/scheduled |
| Invoice system | Converts to invoice when completed |
| Notifications | Status updates via email/SMS |
| Technician dispatch | Auto-assign or manual assignment |
| Equipment/Properties | Customer selects existing property/equipment |

## Customer Flow

```
1. Customer logs into portal (or uses storefront)
2. Selects "Request Service" → Express Service form
3. Chooses from subscriber's eligible services
4. Selects property/location (if applicable)
5. Describes problem + uploads photos (if required)
6. Sets urgency (normal / urgent / emergency)
7. If deposit required → pays deposit via connected Stripe account
8. Request submitted → status: 'submitted'
9. Subscriber staff acknowledges → 'acknowledged'
10. Technician assigned → 'assigned'
11. Job scheduled → 'scheduled'
12. Work performed → 'in_progress' → 'completed'
13. Invoice created → 'invoiced'
14. Customer pays → 'paid'
```

## Subscriber Admin Flow

```
1. Enable Express Service (Settings → Customer Experience → Express Service)
2. Choose eligible services from catalog
3. Set service areas (optional)
4. Configure requirements (photos, description)
5. Configure deposit (optional, requires Customer Payments enabled)
6. Configure notifications
7. Configure assignment (auto-assign or manual)
8. Publish (make visible in portal/storefront)
```

## Settings (stored in `express_service_settings`)

- `enabled` — master toggle
- `eligible_service_ids` — which services can be requested
- `service_area_ids` — geographic restrictions
- `require_photos` — customer must upload photos
- `require_description` — customer must describe problem (default true)
- `deposit_required` — collect deposit on submission
- `deposit_amount_cents` — fixed deposit amount
- `payment_required` — require payment on completion
- `emergency_enabled` — allow emergency urgency
- `after_hours_enabled` — allow after-hours requests
- `notifications_enabled` — send status notifications
- `auto_assign` — auto-assign to available technician

## Payment Rules

- Deposits collected via subscriber's Connected Stripe Account
- Final invoice payments follow standard Domain B flow
- All payment security rules from `07-security-model.md` apply
- Express Service CANNOT accept payments if `accept_customer_payments = false`

## File Upload Safety

- Accepted types: jpg, jpeg, png, pdf, heic (configurable)
- Max size: 10MB per file, 50MB total per request
- Content-type verification (magic bytes, not just extension)
- Stored in tenant-scoped path (S3 or equivalent)
- No executable files permitted

## Subscriber HOW TO (P1-10)

Must cover:
1. Enable feature
2. Choose eligible services
3. Set pricing for Express-eligible services
4. Define service areas
5. Configure request behavior
6. Set photo/document requirements
7. Configure deposit
8. Enable payments
9. Configure notifications
10. Assign staff / auto-assign
11. Publish
12. Track requests
13. Convert to job/invoice
14. Collect final payment

## Customer HOW TO

Must cover:
1. Access Express Service (portal or storefront)
2. Select service needed
3. Describe issue + upload photos
4. Select urgency
5. Pay deposit (if required)
6. Receive confirmation
7. Track request status
8. Service completed
9. Receive invoice
10. Pay online
