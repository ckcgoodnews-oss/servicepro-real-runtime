const { getRepositories } = require('../apps/api/src/repositories/repositoryFactory');
const repo=getRepositories().phase38Version6FoundationRc;
const row=repo.create({tenantId:process.env.DEFAULT_TENANT_ID||'tenant_demo',domain:'observability-platform-upgrade',name:'Observability Platform Upgrade',owner:'platform'});
console.log(JSON.stringify({ok:true,row},null,2));
