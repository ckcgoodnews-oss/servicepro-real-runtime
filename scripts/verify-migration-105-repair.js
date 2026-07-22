const fs = require('fs');
const path = require('path');

const repo = process.argv[2] || process.cwd();
const migration = path.join(repo, 'packages', 'database', 'postgres', '105_subscription_entitlement_runtime.sql');
if (!fs.existsSync(migration)) throw new Error(`Missing ${migration}`);
const sql = fs.readFileSync(migration, 'utf8');
const tables = ['subscription_plans','plan_entitlements','tenant_subscriptions','usage_meters','usage_records','billing_invoices'];
for (const table of tables) {
  if (!new RegExp(`ALTER TABLE\\s+${table}[\\s\\S]*?ADD COLUMN IF NOT EXISTS`, 'i').test(sql)) {
    throw new Error(`Migration 105 does not reconcile legacy schema for ${table}`);
  }
}
for (const token of ['idx_tenant_subscriptions_tenant_status','idx_plan_entitlements_plan','idx_usage_records_tenant_meter','idx_billing_invoices_tenant_status']) {
  if (!sql.includes(token)) throw new Error(`Missing index ${token}`);
}
console.log('PASS: Migration 105 reconciles partial legacy schemas before index creation.');
