const fs=require('fs');
const path=require('path');
const { dataFile } = require('../db/store');
function checks(){
 const secret=process.env.SESSION_SECRET||'';
 return [
  {name:'NODE_ENV set', ok: Boolean(process.env.NODE_ENV), detail: process.env.NODE_ENV || 'missing'},
  {name:'Strong session secret', ok: secret.length>=32 && !secret.includes('replace-this'), detail: `${secret.length} chars`},
  {name:'Data file exists', ok: fs.existsSync(dataFile), detail: dataFile},
  {name:'HTTPS enforcement configured', ok: process.env.NODE_ENV!=='production' || process.env.ENFORCE_HTTPS==='true', detail: `ENFORCE_HTTPS=${process.env.ENFORCE_HTTPS}`},
  {name:'Trust proxy reviewed', ok: process.env.NODE_ENV!=='production' || process.env.TRUST_PROXY==='true', detail: `TRUST_PROXY=${process.env.TRUST_PROXY}`},
  {name:'Backup directory configured', ok: Boolean(process.env.BACKUP_DIR), detail: process.env.BACKUP_DIR || 'missing'}
 ];
}
function summary(){ const rows=checks(); return { rows, passed: rows.filter(r=>r.ok).length, failed: rows.filter(r=>!r.ok).length }; }
module.exports={checks,summary};
