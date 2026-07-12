const { getRepositories }=require('../apps/api/src/repositories/repositoryFactory');
const repo=getRepositories().phase33Version5Ga;
const row=repo.create({tenantId:process.env.DEFAULT_TENANT_ID||'tenant_demo',domain:'version-5-rc-telemetry',name:'Version 5 Rc Telemetry',owner:'platform'});
console.log(JSON.stringify(row,null,2));
