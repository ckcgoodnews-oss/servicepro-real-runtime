const { getRepositories, resetRepositoriesForTest } = require('../apps/api/src/repositories/repositoryFactory');
async function main() {
  resetRepositoriesForTest();
  const repositories=getRepositories();
  const row=await repositories.phase19PlatformExtensibility.create({tenantId:process.env.DEFAULT_TENANT_ID||'tenant_demo',domain:'custom-object-framework',name:'Custom Object Framework',owner:'platform'});
  const active=await repositories.phase19PlatformExtensibility.transition(row.id,'activate');
  if(repositories.store.close)await repositories.store.close();
  console.log(JSON.stringify({ok:true,data:active},null,2));
}
main().catch(error=>{console.error(error);process.exit(1);});
