const { getRepositories, resetRepositoriesForTest } = require('../apps/api/src/repositories/repositoryFactory');
async function main() {
  resetRepositoriesForTest();
  const repositories=getRepositories();
  const row=await repositories.phase15PostGaLts.create({tenantId:process.env.DEFAULT_TENANT_ID||'tenant_demo',domain:'version-2-0-1-maintenance-release',name:'Version 2 0 1 Maintenance Release',owner:'platform'});
  const active=await repositories.phase15PostGaLts.transition(row.id,'activate');
  if(repositories.store.close)await repositories.store.close();
  console.log(JSON.stringify({ok:true,data:active},null,2));
}
main().catch(error=>{console.error(error);process.exit(1);});
