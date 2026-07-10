const fs = require('fs');
const path = require('path');
const { v4: uuid } = require('uuid');
const store = require('../db');

const now = () => new Date().toISOString();
const backupDir = () => path.resolve(process.cwd(), process.env.BACKUP_DIR || './data/backups');
const tenantTables = [
  'business_settings','services','customers','jobs','pricing','job_notes','job_media',
  'estimates','estimate_items','invoices','invoice_items','dispatch_events',
  'customer_magic_links','notification_queue','document_events','subscriptions',
  'billing_events','storage_objects','domain_settings','audit_logs'
];

function safeFileName(value) {
  return String(value || 'tenant').toLowerCase().replace(/[^a-z0-9._-]+/g, '-').replace(/^-|-$/g, '');
}

async function buildTenantExport(tenantId) {
  const tenant = await store.findOne('tenants', t => t.id === tenantId);
  if (!tenant) throw new Error('Tenant not found.');
  const payload = { format:'servicepro-tenant-export', version:1, exported_at:now(), tenant, tables:{} };
  for (const table of tenantTables) {
    const rows = await store.table(table);
    payload.tables[table] = rows.filter(row => row.tenant_id === tenantId || row.tenant_id === tenantId);
  }
  payload.tables.users = (await store.table('users')).filter(u => u.tenant_id === tenantId);
  return payload;
}

async function createTenantBackup(tenantId, actorUserId = null) {
  const payload = await buildTenantExport(tenantId);
  fs.mkdirSync(backupDir(), { recursive:true });
  const fileName = `${safeFileName(payload.tenant.slug || payload.tenant.name)}-${Date.now()}.json`;
  const fullPath = path.join(backupDir(), fileName);
  fs.writeFileSync(fullPath, JSON.stringify(payload, null, 2));
  const row = { id:uuid(), tenant_id:tenantId, file_name:fileName, file_path:fullPath, size_bytes:fs.statSync(fullPath).size, created_by:actorUserId, created_at:now() };
  await store.insert('backup_history', row);
  return row;
}

async function listTenantBackups(tenantId) {
  return (await store.table('backup_history')).filter(b => b.tenant_id === tenantId).sort((a,b)=>String(b.created_at).localeCompare(String(a.created_at)));
}

async function importTenantPayload(tenantId, payload, options = {}) {
  if (!payload || payload.format !== 'servicepro-tenant-export') throw new Error('Invalid ServicePro tenant export file.');
  const data = await store.read();
  const tables = Object.keys(payload.tables || {});
  for (const table of tables) {
    if (!Array.isArray(data[table])) data[table] = [];
    const incoming = payload.tables[table].map(row => ({ ...row, tenant_id: tenantId }));
    if (options.replace) data[table] = data[table].filter(row => row.tenant_id !== tenantId);
    const existingIds = new Set(data[table].map(row => row.id).filter(Boolean));
    for (const row of incoming) {
      if (row.id && existingIds.has(row.id)) {
        data[table] = data[table].map(existing => existing.id === row.id ? row : existing);
      } else {
        data[table].push(row);
      }
    }
  }
  await store.write(data);
  return { imported_tables: tables.length };
}

module.exports = { buildTenantExport, createTenantBackup, listTenantBackups, importTenantPayload, backupDir };
