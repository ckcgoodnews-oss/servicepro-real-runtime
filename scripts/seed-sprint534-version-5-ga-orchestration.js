const { getRepositories }=require('../apps/api/src/repositories/repositoryFactory');
const repo=getRepositories().phase33Version5Ga;
const row=repo.create({tenantId:process.env.DEFAULT_TENANT_ID||'tenant_demo',domain:'version-5-ga-orchestration',name:'Version 5 Ga Orchestration',owner:'platform'});
console.log(JSON.stringify(row,null,2));
