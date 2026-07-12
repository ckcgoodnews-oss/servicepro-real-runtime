const { getRepositories } = require('../apps/api/src/repositories/repositoryFactory');
const repo=getRepositories().phase34Version5PostGaAssurance;
const row=repo.create({tenantId:process.env.DEFAULT_TENANT_ID||'tenant_demo',domain:'version-5.0.1-maintenance-release',name:'Version 5.0.1 Maintenance Release',owner:'platform'});
console.log(JSON.stringify({ok:true,row},null,2));
