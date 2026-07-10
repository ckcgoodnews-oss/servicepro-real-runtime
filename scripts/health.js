require('dotenv').config();
const store = require('../src/db');
async function main(){
  const data = await store.read();
  const required = ['tenants','users','customers','jobs','audit_logs','backup_history'];
  let ok = true;
  for(const table of required){
    const exists = Array.isArray(data[table]);
    ok = ok && exists;
    console.log(`${exists ? 'OK ' : 'ERR'} ${table}`);
  }
  console.log(`Tenants: ${(data.tenants||[]).length}`);
  console.log(`Users: ${(data.users||[]).length}`);
  if(!ok) process.exit(1);
}
main().catch(err=>{ console.error(err); process.exit(1); });
