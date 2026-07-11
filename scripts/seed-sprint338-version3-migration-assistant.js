const { getRepositories, resetRepositoriesForTest } = require('../apps/api/src/repositories/repositoryFactory');
async function main() {
  resetRepositoriesForTest();
  const repositories=getRepositories();
  const row=await repositories.phase20Version3Foundation.create({tenantId:process.env.DEFAULT_TENANT_ID||'tenant_demo',domain:'version3-migration-assistant',name:'Version3 Migration Assistant',owner:'platform'});
  const active=await repositories.phase20Version3Foundation.transition(row.id,'activate');
  if(repositories.store.close)await repositories.store.close();
  console.log(JSON.stringify({ok:true,data:active},null,2));
}
main().catch(error=>{console.error(error);process.exit(1);});
