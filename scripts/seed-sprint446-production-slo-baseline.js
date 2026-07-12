const { getRepositories }=require('../apps/api/src/repositories/repositoryFactory');
const repo=getRepositories().phase28Version4PostGaReliability;
const row=repo.create({tenantId:process.env.DEFAULT_TENANT_ID||'tenant_demo',domain:'production-slo-baseline',name:'Production Slo Baseline',owner:'platform'});
console.log(JSON.stringify(row,null,2));
