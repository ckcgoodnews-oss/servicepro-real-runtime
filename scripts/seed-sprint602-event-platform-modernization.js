const { getRepositories } = require('../apps/api/src/repositories/repositoryFactory');
const repo=getRepositories().phase38Version6FoundationRc;
const row=repo.create({tenantId:process.env.DEFAULT_TENANT_ID||'tenant_demo',domain:'event-platform-modernization',name:'Event Platform Modernization',owner:'platform'});
console.log(JSON.stringify({ok:true,row},null,2));
