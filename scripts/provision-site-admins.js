// Trusted operator utility. Run after npm run migrate using the API's database
// environment. No credentials are printed or accepted as command-line arguments.
require('dotenv').config();
const crypto = require('node:crypto');
const {createStoreProvider} = require('../apps/api/src/store/storeProvider');
const {createUserRepository} = require('../apps/api/src/repositories/userRepository');
const {createSiteAdminRepository} = require('../apps/api/src/repositories/siteAdminRepository');

async function provision(store,emails) {
  const users=createUserRepository(store);
  const admins=createSiteAdminRepository(store);
  const tenantId=process.env.DEFAULT_TENANT_ID || 'tenant_demo';
  for(const email of emails) {
    let user=await users.findByEmail(tenantId,email);
    let created=false;
    if (!user) {
      // Discard this random initial credential. An existing site administrator
      // must set the account's password through the protected admin page.
      user=await users.create({tenantId,email,name:email,password:crypto.randomBytes(48).toString('base64url'),roles:['admin']});
      created=true;
    }
    if (!user || (user.status && user.status !== 'active')) throw new Error('Account is unavailable; no grant issued');
    await admins.grant({tenantId,userId:user.id,grantedBy:'trusted-operator'});
    console.log(`${email}: site access granted${created ? '; password setup required in Platform admin' : '; existing password preserved'}`);
  }
}
async function main() {
  const emails=[...new Set(process.argv.slice(2).map(value=>value.trim().toLowerCase()))];
  if (!emails.length || emails.some(email=>!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))) throw new Error('Usage: node scripts/provision-site-admins.js email [email ...]');
  const store=createStoreProvider();
  try { await provision(store,emails); } finally { await store.close?.(); }
}
if(require.main===module) main().catch(()=>{console.error('Site admin provisioning failed. Check the migration, account status, and database configuration.');process.exitCode=1;});
module.exports={provision};
