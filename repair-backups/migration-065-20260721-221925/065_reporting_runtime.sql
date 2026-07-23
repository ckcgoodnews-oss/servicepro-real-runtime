-- Sprint 65 PostgreSQL migration: reporting runtime views.
--
-- Compatibility note:
-- Historical tenant_id columns are not uniform across every runtime table.
-- Some deployments use uuid while others use text. Reporting views therefore
-- normalize tenant_id to text at every cross-table boundary. This prevents
-- PostgreSQL UNION and JOIN type-resolution failures while preserving the
-- tenant identifier value used by the application layer.

CREATE OR REPLACE VIEW reporting_revenue_summary AS
SELECT
  tenant_id::text AS tenant_id,
  COUNT(*)::int AS invoice_count,
  COALESCE(SUM(total), 0)::float AS invoice_total,
  COALESCE(SUM(paid_amount), 0)::float AS paid_total,
  COALESCE(SUM(balance_due), 0)::float AS balance_due
FROM invoices
GROUP BY tenant_id::text;

CREATE OR REPLACE VIEW reporting_dashboard_summary AS
WITH tenant_scope AS (
  SELECT tenant_id::text AS tenant_id FROM customers
  UNION
  SELECT tenant_id::text AS tenant_id FROM jobs
  UNION
  SELECT tenant_id::text AS tenant_id FROM invoices
  UNION
  SELECT tenant_id::text AS tenant_id FROM payments
),
customer_totals AS (
  SELECT
    tenant_id::text AS tenant_id,
    COUNT(*) AS customer_count
  FROM customers
  GROUP BY tenant_id::text
),
job_totals AS (
  SELECT
    tenant_id::text AS tenant_id,
    COUNT(*) AS job_count
  FROM jobs
  GROUP BY tenant_id::text
),
invoice_totals AS (
  SELECT
    tenant_id::text AS tenant_id,
    COALESCE(SUM(total), 0) AS invoice_total,
    COALESCE(SUM(balance_due), 0) AS balance_due
  FROM invoices
  GROUP BY tenant_id::text
),
payment_totals AS (
  SELECT
    tenant_id::text AS tenant_id,
    COALESCE(SUM(amount), 0) AS payment_total
  FROM payments
  GROUP BY tenant_id::text
)
SELECT
  t.tenant_id,
  COALESCE(c.customer_count, 0)::int AS customer_count,
  COALESCE(j.job_count, 0)::int AS job_count,
  COALESCE(i.invoice_total, 0)::float AS invoice_total,
  COALESCE(i.balance_due, 0)::float AS balance_due,
  COALESCE(p.payment_total, 0)::float AS payment_total
FROM tenant_scope t
LEFT JOIN customer_totals c ON c.tenant_id = t.tenant_id
LEFT JOIN job_totals j ON j.tenant_id = t.tenant_id
LEFT JOIN invoice_totals i ON i.tenant_id = t.tenant_id
LEFT JOIN payment_totals p ON p.tenant_id = t.tenant_id;

CREATE TABLE IF NOT EXISTS report_run_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL,
  report_key text NOT NULL,
  status text NOT NULL DEFAULT 'success',
  duration_ms integer,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_report_run_events_tenant_time
ON report_run_events (tenant_id, created_at DESC);
