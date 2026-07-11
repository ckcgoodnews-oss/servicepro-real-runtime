const { getRepositories, resetRepositoriesForTest } = require('../apps/api/src/repositories/repositoryFactory');
async function main() {
  resetRepositoriesForTest();
  const repositories=getRepositories();
  const row=await repositories.phase16EnterpriseIntelligence.create({tenantId:process.env.DEFAULT_TENANT_ID||'tenant_demo',domain:'natural-language-reporting',name:'Natural Language Reporting',owner:'platform'});
  const active=await repositories.phase16EnterpriseIntelligence.transition(row.id,'activate');
  if(repositories.store.close)await repositories.store.close();
  console.log(JSON.stringify({ok:true,data:active},null,2));
}
main().catch(error=>{console.error(error);process.exit(1);});
