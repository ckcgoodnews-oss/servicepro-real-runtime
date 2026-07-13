const { getRepositories } = require('../apps/api/src/repositories/repositoryFactory');
const repo=getRepositories().phase38Version6FoundationRc;
const row=repo.create({tenantId:process.env.DEFAULT_TENANT_ID||'tenant_demo',domain:'migration-tooling-v6',name:'Migration Tooling V6',owner:'platform'});
console.log(JSON.stringify({ok:true,row},null,2));
