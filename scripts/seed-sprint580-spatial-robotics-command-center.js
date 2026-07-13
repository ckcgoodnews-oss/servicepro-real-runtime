const { getRepositories } = require('../apps/api/src/repositories/repositoryFactory');
const repo=getRepositories().phase36SpatialRoboticsOperations;
const row=repo.create({tenantId:process.env.DEFAULT_TENANT_ID||'tenant_demo',domain:'spatial-robotics-command-center',name:'Spatial Robotics Command Center',owner:'platform'});
console.log(JSON.stringify({ok:true,row},null,2));
