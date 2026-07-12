const { getRepositories }=require('../apps/api/src/repositories/repositoryFactory');
const repo=getRepositories().phase32Version5FoundationRc;
const row=repo.create({tenantId:process.env.DEFAULT_TENANT_ID||'tenant_demo',domain:'api-version-5-foundation',name:'Api Version 5 Foundation',owner:'platform'});
console.log(JSON.stringify(row,null,2));
