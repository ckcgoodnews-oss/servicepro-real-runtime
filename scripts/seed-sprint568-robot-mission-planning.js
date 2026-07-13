const { getRepositories } = require('../apps/api/src/repositories/repositoryFactory');
const repo=getRepositories().phase36SpatialRoboticsOperations;
const row=repo.create({tenantId:process.env.DEFAULT_TENANT_ID||'tenant_demo',domain:'robot-mission-planning',name:'Robot Mission Planning',owner:'platform'});
console.log(JSON.stringify({ok:true,row},null,2));
