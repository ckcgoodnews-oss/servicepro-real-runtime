const { getRepositories } = require('../apps/api/src/repositories/repositoryFactory');
const repos=getRepositories();
const row=repos.phase41DigitalTwinSimulationPlatform.create({tenantId:process.env.DEFAULT_TENANT_ID||'tenant_demo',domain:'digital-twin-governance',name:'Digital Twin Governance',owner:'platform'});
console.log(JSON.stringify(row,null,2));
