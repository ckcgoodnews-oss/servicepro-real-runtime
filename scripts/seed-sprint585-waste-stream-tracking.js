const { getRepositories } = require('../apps/api/src/repositories/repositoryFactory');
const repo=getRepositories().phase37SustainabilityCircularOperations;
const row=repo.create({tenantId:process.env.DEFAULT_TENANT_ID||'tenant_demo',domain:'waste-stream-tracking',name:'Waste Stream Tracking',owner:'platform'});
console.log(JSON.stringify({ok:true,row},null,2));
