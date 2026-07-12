const { getRepositories } = require('../apps/api/src/repositories/repositoryFactory');
const repo=getRepositories().phase34Version5PostGaAssurance;
const row=repo.create({tenantId:process.env.DEFAULT_TENANT_ID||'tenant_demo',domain:'api-v5-contract-monitoring',name:'Api V5 Contract Monitoring',owner:'platform'});
console.log(JSON.stringify({ok:true,row},null,2));
