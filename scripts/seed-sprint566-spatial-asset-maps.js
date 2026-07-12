const { getRepositories } = require('../apps/api/src/repositories/repositoryFactory');
const repo=getRepositories().phase36SpatialRoboticsOperations;
const row=repo.create({tenantId:process.env.DEFAULT_TENANT_ID||'tenant_demo',domain:'spatial-asset-maps',name:'Spatial Asset Maps',owner:'platform'});
console.log(JSON.stringify({ok:true,row},null,2));
