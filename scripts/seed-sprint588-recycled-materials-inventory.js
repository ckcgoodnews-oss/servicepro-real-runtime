const { getRepositories } = require('../apps/api/src/repositories/repositoryFactory');
const repo=getRepositories().phase37SustainabilityCircularOperations;
const row=repo.create({tenantId:process.env.DEFAULT_TENANT_ID||'tenant_demo',domain:'recycled-materials-inventory',name:'Recycled Materials Inventory',owner:'platform'});
console.log(JSON.stringify({ok:true,row},null,2));
