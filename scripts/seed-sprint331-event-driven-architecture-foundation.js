const { getRepositories, resetRepositoriesForTest } = require('../apps/api/src/repositories/repositoryFactory');
async function main() {
  resetRepositoriesForTest();
  const repositories=getRepositories();
  const row=await repositories.phase20Version3Foundation.create({tenantId:process.env.DEFAULT_TENANT_ID||'tenant_demo',domain:'event-driven-architecture-foundation',name:'Event Driven Architecture Foundation',owner:'platform'});
  const active=await repositories.phase20Version3Foundation.transition(row.id,'activate');
  if(repositories.store.close)await repositories.store.close();
  console.log(JSON.stringify({ok:true,data:active},null,2));
}
main().catch(error=>{console.error(error);process.exit(1);});
