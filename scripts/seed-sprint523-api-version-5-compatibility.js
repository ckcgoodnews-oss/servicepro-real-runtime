const { getRepositories }=require('../apps/api/src/repositories/repositoryFactory');
const repo=getRepositories().phase33Version5Ga;
const row=repo.create({tenantId:process.env.DEFAULT_TENANT_ID||'tenant_demo',domain:'api-version-5-compatibility',name:'Api Version 5 Compatibility',owner:'platform'});
console.log(JSON.stringify(row,null,2));
