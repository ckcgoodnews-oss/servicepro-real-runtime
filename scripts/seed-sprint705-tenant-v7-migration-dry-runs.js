const { getRepositories } = require('../apps/api/src/repositories/repositoryFactory');
const repos=getRepositories();
const row=repos.phase45Version7Ga.create({tenantId:process.env.DEFAULT_TENANT_ID||'tenant_demo',domain:'tenant-v7-migration-dry-runs',name:'Tenant V7 Migration Dry Runs',owner:'platform'});
console.log(JSON.stringify(row,null,2));
