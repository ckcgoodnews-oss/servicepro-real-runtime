const { getRepositories } = require('../apps/api/src/repositories/repositoryFactory');
const repo=getRepositories().phase34Version5PostGaAssurance;
const row=repo.create({tenantId:process.env.DEFAULT_TENANT_ID||'tenant_demo',domain:'disaster-recovery-exercises',name:'Disaster Recovery Exercises',owner:'platform'});
console.log(JSON.stringify({ok:true,row},null,2));
