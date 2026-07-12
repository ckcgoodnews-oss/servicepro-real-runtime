const { getRepositories } = require('../apps/api/src/repositories/repositoryFactory');
const repo=getRepositories().phase39Version6Ga;
const row=repo.create({tenantId:process.env.DEFAULT_TENANT_ID||'tenant_demo',domain:'api-v6-compatibility',name:'Api V6 Compatibility',owner:'platform'});
console.log(JSON.stringify({ok:true,row},null,2));
