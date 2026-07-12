const { getRepositories }=require('../apps/api/src/repositories/repositoryFactory');
const repo=getRepositories().phase33Version5Ga;
const row=repo.create({tenantId:process.env.DEFAULT_TENANT_ID||'tenant_demo',domain:'tenant-v5-migration-dry-runs',name:'Tenant V5 Migration Dry Runs',owner:'platform'});
console.log(JSON.stringify(row,null,2));
