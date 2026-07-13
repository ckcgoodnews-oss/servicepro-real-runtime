const { getRepositories } = require('../apps/api/src/repositories/repositoryFactory');
const repo=getRepositories().phase37SustainabilityCircularOperations;
const row=repo.create({tenantId:process.env.DEFAULT_TENANT_ID||'tenant_demo',domain:'customer-sustainability-reporting',name:'Customer Sustainability Reporting',owner:'platform'});
console.log(JSON.stringify({ok:true,row},null,2));
