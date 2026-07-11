const { getRepositories, resetRepositoriesForTest } = require('../apps/api/src/repositories/repositoryFactory');
async function main() {
  resetRepositoriesForTest();
  const repositories=getRepositories();
  const row=await repositories.phase17GlobalScale.create({tenantId:process.env.DEFAULT_TENANT_ID||'tenant_demo',domain:'cross-region-failover',name:'Cross Region Failover',owner:'platform'});
  const active=await repositories.phase17GlobalScale.transition(row.id,'activate');
  if(repositories.store.close)await repositories.store.close();
  console.log(JSON.stringify({ok:true,data:active},null,2));
}
main().catch(error=>{console.error(error);process.exit(1);});
