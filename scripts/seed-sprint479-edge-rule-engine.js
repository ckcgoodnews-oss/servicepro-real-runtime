const { getRepositories }=require('../apps/api/src/repositories/repositoryFactory');
const repo=getRepositories().phase30ConnectedAssetsEdge;
const row=repo.create({tenantId:process.env.DEFAULT_TENANT_ID||'tenant_demo',domain:'edge-rule-engine',name:'Edge Rule Engine',owner:'platform'});
console.log(JSON.stringify(row,null,2));
