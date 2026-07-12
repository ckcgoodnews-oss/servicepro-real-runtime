const { getRepositories } = require('../apps/api/src/repositories/repositoryFactory');
const repo=getRepositories().phase39Version6Ga;
const row=repo.create({tenantId:process.env.DEFAULT_TENANT_ID||'tenant_demo',domain:'version-6-ga-orchestration',name:'Version 6 Ga Orchestration',owner:'platform'});
console.log(JSON.stringify({ok:true,row},null,2));
