const { getRepositories } = require('../apps/api/src/repositories/repositoryFactory');
const repo=getRepositories().phase36SpatialRoboticsOperations;
const row=repo.create({tenantId:process.env.DEFAULT_TENANT_ID||'tenant_demo',domain:'robot-fleet-analytics',name:'Robot Fleet Analytics',owner:'platform'});
console.log(JSON.stringify({ok:true,row},null,2));
