const fs = require('fs');
const path = require('path');
const DB_FILE = path.resolve(process.cwd(), process.env.DB_FILE || './data/servicepro.json');
const empty = () => ({ tenants:[], users:[], business_settings:[], services:[], customers:[], jobs:[], pricing:[], job_notes:[], job_media:[], audit_logs:[], estimates:[], estimate_items:[], invoices:[], invoice_items:[], dispatch_events:[], customer_magic_links:[], notification_queue:[], document_events:[], subscriptions:[], billing_events:[], storage_objects:[], domain_settings:[], backup_history:[] });
function ensure() { fs.mkdirSync(path.dirname(DB_FILE), { recursive:true }); if (!fs.existsSync(DB_FILE)) fs.writeFileSync(DB_FILE, JSON.stringify(empty(), null, 2)); }
async function read() { ensure(); return JSON.parse(fs.readFileSync(DB_FILE, 'utf8')); }
async function write(data) { ensure(); fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2)); }
async function table(name) { const data = await read(); return data[name] || []; }
async function findOne(name, predicate) { return (await table(name)).find(predicate) || null; }
async function insert(name, row) { const data = await read(); data[name].push(row); await write(data); return row; }
async function update(name, predicate, patcher) { const data = await read(); let count=0; data[name]=data[name].map(row=>{ if(predicate(row)){ count++; return { ...row, ...(typeof patcher==='function'?patcher(row):patcher) }; } return row; }); await write(data); return count; }
async function remove(name, predicate) { const data = await read(); const before=data[name].length; data[name]=data[name].filter(r=>!predicate(r)); await write(data); return before-data[name].length; }
async function reset() { await write(empty()); }
module.exports = { read, write, table, findOne, insert, update, remove, reset };
