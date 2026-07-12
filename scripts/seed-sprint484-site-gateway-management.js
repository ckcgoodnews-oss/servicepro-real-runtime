const { getRepositories }=require('../apps/api/src/repositories/repositoryFactory');
const repo=getRepositories().phase30ConnectedAssetsEdge;
const row=repo.create({tenantId:process.env.DEFAULT_TENANT_ID||'tenant_demo',domain:'site-gateway-management',name:'Site Gateway Management',owner:'platform'});
console.log(JSON.stringify(row,null,2));
