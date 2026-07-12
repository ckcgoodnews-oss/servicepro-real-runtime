const { getRepositories }=require('../apps/api/src/repositories/repositoryFactory');
const repo=getRepositories().phase28Version4PostGaReliability;
const row=repo.create({tenantId:process.env.DEFAULT_TENANT_ID||'tenant_demo',domain:'version-4-0-1-maintenance-release',name:'Version 4 0 1 Maintenance Release',owner:'platform'});
console.log(JSON.stringify(row,null,2));
