const { getRepositories } = require('../apps/api/src/repositories/repositoryFactory');
const repo=getRepositories().phase37SustainabilityCircularOperations;
const row=repo.create({tenantId:process.env.DEFAULT_TENANT_ID||'tenant_demo',domain:'circular-asset-lifecycle',name:'Circular Asset Lifecycle',owner:'platform'});
console.log(JSON.stringify({ok:true,row},null,2));
