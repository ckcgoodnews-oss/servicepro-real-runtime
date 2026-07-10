const fs = require('fs');
const path = require('path');
const { nanoid } = require('nanoid');

const dataFile = path.resolve(process.env.DATA_FILE || './data/servicepro.json');

const empty = {
  tenants: [], users: [], tenantUsers: [], customers: [], jobs: [],
  reviews: [], reviewRequests: [], referralSources: [], serviceReminders: [],
  campaigns: [], campaignRecipients: [], auditLogs: []
};

function ensureFile() {
  fs.mkdirSync(path.dirname(dataFile), { recursive: true });
  if (!fs.existsSync(dataFile)) fs.writeFileSync(dataFile, JSON.stringify(empty, null, 2));
}

function read() {
  ensureFile();
  const db = JSON.parse(fs.readFileSync(dataFile, 'utf8'));
  for (const key of Object.keys(empty)) if (!db[key]) db[key] = [];
  return db;
}

function write(data) {
  ensureFile();
  fs.writeFileSync(dataFile, JSON.stringify(data, null, 2));
}

function now() { return new Date().toISOString(); }
function id(prefix) { return `${prefix}_${nanoid(10)}`; }

function insert(table, row) {
  const db = read();
  const record = { id: row.id || id(table.slice(0, 4)), createdAt: now(), updatedAt: now(), ...row };
  db[table].push(record);
  write(db);
  return record;
}

function update(table, recordId, patch) {
  const db = read();
  const idx = db[table].findIndex(x => x.id === recordId);
  if (idx === -1) return null;
  db[table][idx] = { ...db[table][idx], ...patch, updatedAt: now() };
  write(db);
  return db[table][idx];
}

function byTenant(table, tenantId) {
  return read()[table].filter(x => x.tenantId === tenantId);
}

function audit(tenantId, userId, action, entityType, entityId, details = {}) {
  return insert('auditLogs', { tenantId, userId, action, entityType, entityId, details });
}

module.exports = { read, write, insert, update, byTenant, audit, now, id };
