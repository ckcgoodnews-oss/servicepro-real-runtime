const assert = require('assert');
const fs = require('fs');
const path = require('path');

const file = path.resolve('packages/database/postgres/065_reporting_runtime.sql');
const sql = fs.readFileSync(file, 'utf8');

const unionBlock = sql.match(/WITH\s+tenant_scope\s+AS\s*\(([\s\S]*?)\),\s*customer_totals/i);
assert(unionBlock, 'tenant_scope CTE was not found.');

const sources = ['customers', 'jobs', 'invoices', 'payments'];
for (const source of sources) {
  assert(
    new RegExp(`SELECT\\s+tenant_id::text\\s+AS\\s+tenant_id\\s+FROM\\s+${source}`, 'i').test(unionBlock[1]),
    `${source}.tenant_id is not normalized to text in tenant_scope.`
  );
}

assert(!/SELECT\s+tenant_id\s+FROM\s+(customers|jobs|invoices|payments)/i.test(unionBlock[1]),
  'An uncast tenant_id remains in tenant_scope.');

for (const cte of ['customer_totals', 'job_totals', 'invoice_totals', 'payment_totals']) {
  assert(new RegExp(`${cte}\\s+AS`, 'i').test(sql), `Missing ${cte} CTE.`);
}

assert(/CREATE\s+OR\s+REPLACE\s+VIEW\s+reporting_revenue_summary/i.test(sql));
assert(/CREATE\s+OR\s+REPLACE\s+VIEW\s+reporting_dashboard_summary/i.test(sql));
assert(/CREATE\s+TABLE\s+IF\s+NOT\s+EXISTS\s+report_run_events/i.test(sql));

console.log('PASS: migration065-reporting-runtime-repair.test.js');
