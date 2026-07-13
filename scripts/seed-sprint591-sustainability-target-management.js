const { getRepositories } = require('../apps/api/src/repositories/repositoryFactory');
const repo=getRepositories().phase37SustainabilityCircularOperations;
const row=repo.create({tenantId:process.env.DEFAULT_TENANT_ID||'tenant_demo',domain:'sustainability-target-management',name:'Sustainability Target Management',owner:'platform'});
console.log(JSON.stringify({ok:true,row},null,2));
