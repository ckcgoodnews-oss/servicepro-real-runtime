const { getRepositories } = require('../apps/api/src/repositories/repositoryFactory');
const repo=getRepositories().phase36SpatialRoboticsOperations;
const row=repo.create({tenantId:process.env.DEFAULT_TENANT_ID||'tenant_demo',domain:'robot-operator-handoff',name:'Robot Operator Handoff',owner:'platform'});
console.log(JSON.stringify({ok:true,row},null,2));
