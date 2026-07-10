-- Sprint 87 PostgreSQL migration: service territories and routing rules.

CREATE TABLE IF NOT EXISTS service_territories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL,
  code text NOT NULL,
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  active boolean NOT NULL DEFAULT true,
  priority integer NOT NULL DEFAULT 100,
  color text NOT NULL DEFAULT '',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, code)
);

CREATE TABLE IF NOT EXISTS territory_coverage_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL,
  territory_id uuid NOT NULL,
  rule_type text NOT NULL,
  postal_code text NOT NULL DEFAULT '',
  postal_prefix text NOT NULL DEFAULT '',
  city text NOT NULL DEFAULT '',
  county text NOT NULL DEFAULT '',
  state text NOT NULL DEFAULT '',
  country text NOT NULL DEFAULT 'US',
  active boolean NOT NULL DEFAULT true,
  priority integer NOT NULL DEFAULT 100,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS technician_territories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL,
  technician_id uuid NOT NULL,
  territory_id uuid NOT NULL,
  preference_rank integer NOT NULL DEFAULT 100,
  active boolean NOT NULL DEFAULT true,
  notes text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, technician_id, territory_id)
);

CREATE INDEX IF NOT EXISTS idx_service_territories_tenant_active
ON service_territories (tenant_id, active, priority);

CREATE INDEX IF NOT EXISTS idx_territory_rules_tenant_territory
ON territory_coverage_rules (tenant_id, territory_id, active, priority);

CREATE INDEX IF NOT EXISTS idx_territory_rules_postal
ON territory_coverage_rules (tenant_id, postal_code, postal_prefix);

CREATE INDEX IF NOT EXISTS idx_technician_territories_tenant_territory
ON technician_territories (tenant_id, territory_id, active, preference_rank);
