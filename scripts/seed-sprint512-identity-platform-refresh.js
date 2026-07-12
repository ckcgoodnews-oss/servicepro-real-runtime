const { getRepositories }=require('../apps/api/src/repositories/repositoryFactory');
const repo=getRepositories().phase32Version5FoundationRc;
const row=repo.create({tenantId:process.env.DEFAULT_TENANT_ID||'tenant_demo',domain:'identity-platform-refresh',name:'Identity Platform Refresh',owner:'platform'});
console.log(JSON.stringify(row,null,2));
