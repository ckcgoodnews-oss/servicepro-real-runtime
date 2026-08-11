# 05 — Data Model / Schema

## Migration Strategy

- Forward migrations only — never edit already-applied migrations
- All migrations idempotent (`IF NOT EXISTS`, `ON CONFLICT DO NOTHING`)
- Next available number: **782**
- All new tables include `tenant_id` column
- Existing tables altered with `ADD COLUMN IF NOT EXISTS` + DEFAULT values

---

## Migration 782: `782_subscriber_payment_settings.sql`

### Table: `subscriber_stripe_accounts`

**Purpose:** Track each subscriber's Stripe Express connected account.  
**Tenant ownership:** `tenant_id` column, one account per tenant.

| Column | Type | Constraints |
|--------|------|-------------|
| id | uuid | PK, DEFAULT gen_random_uuid() |
| tenant_id | text | NOT NULL, UNIQUE |
| stripe_account_id | text | NOT NULL, UNIQUE |
| account_type | text | NOT NULL DEFAULT 'express' |
| status | text | NOT NULL DEFAULT 'pending' |
| charges_enabled | boolean | DEFAULT false |
| payouts_enabled | boolean | DEFAULT false |
| details_submitted | boolean | DEFAULT false |
| country | text | DEFAULT '' |
| default_currency | text | DEFAULT 'usd' |
| business_type | text | DEFAULT '' |
| disconnected_at | timestamptz | NULL |
| metadata | jsonb | DEFAULT '{}' |
| created_at | timestamptz | DEFAULT now() |
| updated_at | timestamptz | DEFAULT now() |

**Indexes:**
- `UNIQUE(tenant_id)` — one connected account per subscriber
- `UNIQUE(stripe_account_id)` — webhook tenant resolution

**Check:** `status IN ('pending','onboarding','restricted','active','restricted_soon','disabled','disconnected')`

### Table: `subscriber_payment_settings`

**Purpose:** Subscriber-scoped payment configuration.  
**Tenant ownership:** `tenant_id` UNIQUE.

| Column | Type | Default |
|--------|------|---------|
| id | uuid | PK, gen_random_uuid() |
| tenant_id | text | NOT NULL, UNIQUE |
| accept_customer_payments | boolean | false |
| default_currency | text | 'usd' |
| accepted_methods | jsonb | '["card"]' |
| deposits_enabled | boolean | false |
| progress_payments_enabled | boolean | false |
| partial_payments_enabled | boolean | true |
| saved_payment_methods | boolean | false |
| tips_enabled | boolean | false |
| convenience_fee_enabled | boolean | false |
| convenience_fee_percent | numeric(5,4) | 0 |
| automatic_receipts | boolean | true |
| payment_reminders | boolean | false |
| refund_permission | text | 'owner_only' |
| created_at | timestamptz | now() |
| updated_at | timestamptz | now() |

**Check:** `refund_permission IN ('owner_only','admin','billing_role')`

### Table: `customer_payment_events` (Financial Ledger)

**Purpose:** Immutable event-sourced financial ledger for all customer payment activity.  
**Tenant ownership:** `tenant_id` column.

| Column | Type | Constraints |
|--------|------|-------------|
| id | uuid | PK, gen_random_uuid() |
| tenant_id | text | NOT NULL |
| invoice_id | uuid | NULL (FK → invoices) |
| payment_id | uuid | NULL (FK → payments) |
| customer_id | uuid | NULL |
| event_type | text | NOT NULL |
| domain | text | NOT NULL DEFAULT 'customer_invoice' |
| amount_cents | integer | NOT NULL |
| currency | text | DEFAULT 'usd' |
| balance_before_cents | integer | NULL |
| balance_after_cents | integer | NULL |
| stripe_payment_intent_id | text | DEFAULT '' |
| stripe_charge_id | text | DEFAULT '' |
| stripe_refund_id | text | DEFAULT '' |
| idempotency_key | text | NOT NULL, UNIQUE |
| metadata | jsonb | DEFAULT '{}' |
| created_at | timestamptz | DEFAULT now() |

**Indexes:**
- `UNIQUE(idempotency_key)` — deduplication
- `idx_cpe_tenant_invoice(tenant_id, invoice_id)`
- `idx_cpe_tenant_type(tenant_id, event_type, created_at DESC)`

**Check:** `event_type IN ('payment_created','payment_pending','payment_succeeded','payment_failed','payment_applied','deposit_applied','partial_payment_applied','refund_requested','refund_succeeded','partial_refund','dispute_opened','dispute_won','dispute_lost','chargeback','credit','adjustment')`  
**Check:** `domain IN ('customer_invoice','customer_membership','platform_subscription')`

### ALTER: `payments` table

Add columns (IF NOT EXISTS):

| Column | Type | Default |
|--------|------|---------|
| stripe_payment_intent_id | text | '' |
| stripe_charge_id | text | '' |
| stripe_connected_account_id | text | '' |
| idempotency_key | text | NULL |
| amount_cents | integer | NULL |
| currency | text | 'usd' |
| payment_type | text | 'full' |
| completed_at | timestamptz | NULL |
| failed_at | timestamptz | NULL |
| failure_reason | text | '' |
| refunded_amount_cents | integer | 0 |
| refunded_at | timestamptz | NULL |
| stripe_refund_id | text | '' |

Add: `CREATE UNIQUE INDEX IF NOT EXISTS idx_payments_idempotency ON payments(idempotency_key) WHERE idempotency_key IS NOT NULL`

### ALTER: `invoices` table

Add columns (IF NOT EXISTS):

| Column | Type | Default |
|--------|------|---------|
| invoice_number | text | NULL |
| payment_terms_days | integer | 30 |
| due_date | date | NULL |
| deposit_required_cents | integer | 0 |
| deposit_paid_cents | integer | 0 |
| currency | text | 'usd' |
| sent_at | timestamptz | NULL |
| paid_at | timestamptz | NULL |
| payment_link_token | text | NULL |
| payment_link_expires_at | timestamptz | NULL |

Add: `CREATE UNIQUE INDEX IF NOT EXISTS idx_invoices_number ON invoices(tenant_id, invoice_number) WHERE invoice_number IS NOT NULL`  
Add: `CREATE UNIQUE INDEX IF NOT EXISTS idx_invoices_payment_link ON invoices(payment_link_token) WHERE payment_link_token IS NOT NULL`

---

## Migration 783: `783_express_service.sql`

### Table: `express_service_settings`

**Purpose:** Subscriber-scoped Express Service configuration.  
**Tenant ownership:** `tenant_id` UNIQUE.

| Column | Type | Default |
|--------|------|---------|
| id | uuid | PK, gen_random_uuid() |
| tenant_id | text | NOT NULL, UNIQUE |
| enabled | boolean | false |
| eligible_service_ids | jsonb | '[]' |
| service_area_ids | jsonb | '[]' |
| require_photos | boolean | false |
| require_description | boolean | true |
| deposit_required | boolean | false |
| deposit_amount_cents | integer | 0 |
| payment_required | boolean | false |
| emergency_enabled | boolean | false |
| after_hours_enabled | boolean | false |
| notifications_enabled | boolean | true |
| auto_assign | boolean | false |
| created_at | timestamptz | now() |
| updated_at | timestamptz | now() |

### Table: `express_service_requests`

**Purpose:** Track customer Express Service requests through lifecycle.  
**Tenant ownership:** `tenant_id` column.

| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK, gen_random_uuid() |
| tenant_id | text | NOT NULL |
| customer_id | uuid | NULL |
| portal_account_id | uuid | NULL |
| service_id | uuid | NULL |
| property_id | uuid | NULL |
| description | text | NOT NULL |
| urgency | text | DEFAULT 'normal' |
| photos | jsonb | DEFAULT '[]' |
| status | text | DEFAULT 'submitted' |
| assigned_technician_id | uuid | NULL |
| converted_job_id | uuid | NULL |
| converted_invoice_id | uuid | NULL |
| deposit_payment_id | uuid | NULL |
| final_payment_id | uuid | NULL |
| created_at | timestamptz | now() |
| updated_at | timestamptz | now() |

**Check:** `urgency IN ('normal','urgent','emergency')`  
**Check:** `status IN ('submitted','acknowledged','assigned','scheduled','in_progress','completed','invoiced','paid','cancelled')`  
**Indexes:** `idx_esr_tenant(tenant_id)`, `idx_esr_customer(tenant_id, customer_id)`, `idx_esr_status(tenant_id, status)`

---

## Migration 784: `784_customer_memberships.sql` (P2 — Schema Only)

### Table: `membership_plans`

| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| tenant_id | text | NOT NULL |
| name | text | NOT NULL |
| description | text | DEFAULT '' |
| billing_interval | text | DEFAULT 'monthly' |
| price_cents | integer | NOT NULL |
| currency | text | DEFAULT 'usd' |
| stripe_product_id | text | DEFAULT '' |
| stripe_price_id | text | DEFAULT '' |
| entitlements | jsonb | DEFAULT '[]' |
| status | text | DEFAULT 'active' |
| created_at | timestamptz | now() |
| updated_at | timestamptz | now() |

### Table: `customer_memberships`

| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| tenant_id | text | NOT NULL |
| customer_id | uuid | NOT NULL |
| plan_id | uuid | FK → membership_plans |
| status | text | DEFAULT 'active' |
| stripe_subscription_id | text | DEFAULT '' |
| current_period_start | timestamptz | |
| current_period_end | timestamptz | |
| cancelled_at | timestamptz | NULL |
| cancel_reason | text | DEFAULT '' |
| created_at | timestamptz | now() |
| updated_at | timestamptz | now() |

### Table: `membership_entitlement_usage`

| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| tenant_id | text | NOT NULL |
| membership_id | uuid | FK → customer_memberships |
| entitlement_type | text | NOT NULL |
| granted | numeric | |
| used | numeric | DEFAULT 0 |
| period_start | date | |
| period_end | date | |
| created_at | timestamptz | now() |

---

## Backward Compatibility

- Existing `payments` table rows unchanged — new columns have defaults
- Existing `invoices` table rows unchanged — new columns nullable/defaulted
- `payment_application_events` table remains as-is (coexists with new ledger)
- `features.payments` boolean continues to work (controls manual payment recording UI)
- New `accept_customer_payments` is a separate additional gate for online payments
