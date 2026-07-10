const fs=require('fs');
const path=require('path');
const { read } = require('../db/store');
function backupDir(){ return path.resolve(process.env.BACKUP_DIR || './backups'); }
function createBackup(){ fs.mkdirSync(backupDir(),{recursive:true}); const stamp=new Date().toISOString().replace(/[:.]/g,'-'); const file=path.join(backupDir(),`servicepro-backup-${stamp}.json`); fs.writeFileSync(file, JSON.stringify(read(),null,2)); return file; }
function listBackups(){ fs.mkdirSync(backupDir(),{recursive:true}); return fs.readdirSync(backupDir()).filter(f=>f.endsWith('.json')).map(f=>({name:f, path:path.join(backupDir(),f), size:fs.statSync(path.join(backupDir(),f)).size})).sort((a,b)=>b.name.localeCompare(a.name)); }
function verifyBackup(file){ const raw=fs.readFileSync(file,'utf8'); const parsed=JSON.parse(raw); const required=['tenants','users','tenantUsers']; return { file, ok: required.every(k=>Array.isArray(parsed[k])), required }; }
module.exports={createBackup,listBackups,verifyBackup,backupDir};
