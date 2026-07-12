const { getRepositories }=require('../apps/api/src/repositories/repositoryFactory');
const repo=getRepositories().phase33Version5Ga;
const row=repo.create({tenantId:process.env.DEFAULT_TENANT_ID||'tenant_demo',domain:'database-v5-upgrade-certification',name:'Database V5 Upgrade Certification',owner:'platform'});
console.log(JSON.stringify(row,null,2));
