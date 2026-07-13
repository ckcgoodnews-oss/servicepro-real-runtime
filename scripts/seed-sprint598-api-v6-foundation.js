const { getRepositories } = require('../apps/api/src/repositories/repositoryFactory');
const repo=getRepositories().phase38Version6FoundationRc;
const row=repo.create({tenantId:process.env.DEFAULT_TENANT_ID||'tenant_demo',domain:'api-v6-foundation',name:'Api V6 Foundation',owner:'platform'});
console.log(JSON.stringify({ok:true,row},null,2));
