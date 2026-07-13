const { getRepositories } = require('../apps/api/src/repositories/repositoryFactory');
const repo=getRepositories().phase39Version6Ga;
const row=repo.create({tenantId:process.env.DEFAULT_TENANT_ID||'tenant_demo',domain:'tenant-v6-migration-dry-runs',name:'Tenant V6 Migration Dry Runs',owner:'platform'});
console.log(JSON.stringify({ok:true,row},null,2));
