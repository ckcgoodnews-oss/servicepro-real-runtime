const { getRepositories } = require('../apps/api/src/repositories/repositoryFactory');
const repo=getRepositories().phase34Version5PostGaAssurance;
const row=repo.create({tenantId:process.env.DEFAULT_TENANT_ID||'tenant_demo',domain:'customer-adoption-assurance',name:'Customer Adoption Assurance',owner:'platform'});
console.log(JSON.stringify({ok:true,row},null,2));
