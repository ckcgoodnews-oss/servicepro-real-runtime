const { getRepositories }=require('../apps/api/src/repositories/repositoryFactory');
const repo=getRepositories().phase30ConnectedAssetsEdge;
const row=repo.create({tenantId:process.env.DEFAULT_TENANT_ID||'tenant_demo',domain:'telemetry-ingestion',name:'Telemetry Ingestion',owner:'platform'});
console.log(JSON.stringify(row,null,2));
