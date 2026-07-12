const { getRepositories } = require('../apps/api/src/repositories/repositoryFactory');
const repo=getRepositories().phase34Version5PostGaAssurance;
const row=repo.create({tenantId:process.env.DEFAULT_TENANT_ID||'tenant_demo',domain:'post-ga-regression-management',name:'Post-Ga Regression Management',owner:'platform'});
console.log(JSON.stringify({ok:true,row},null,2));
