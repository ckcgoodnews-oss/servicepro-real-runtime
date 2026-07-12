const { getRepositories }=require('../apps/api/src/repositories/repositoryFactory');
const repo=getRepositories().phase30ConnectedAssetsEdge;
const row=repo.create({tenantId:process.env.DEFAULT_TENANT_ID||'tenant_demo',domain:'edge-security-posture',name:'Edge Security Posture',owner:'platform'});
console.log(JSON.stringify(row,null,2));
