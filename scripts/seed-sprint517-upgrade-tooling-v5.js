const { getRepositories }=require('../apps/api/src/repositories/repositoryFactory');
const repo=getRepositories().phase32Version5FoundationRc;
const row=repo.create({tenantId:process.env.DEFAULT_TENANT_ID||'tenant_demo',domain:'upgrade-tooling-v5',name:'Upgrade Tooling V5',owner:'platform'});
console.log(JSON.stringify(row,null,2));
