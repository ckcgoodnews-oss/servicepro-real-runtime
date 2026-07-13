const { getRepositories } = require('../apps/api/src/repositories/repositoryFactory');
const repos=getRepositories();
const row=repos.phase42AutonomousEnterpriseOperations.create({tenantId:process.env.DEFAULT_TENANT_ID||'tenant_demo',domain:'autonomous-inventory',name:'Autonomous Inventory',owner:'platform'});
console.log(JSON.stringify(row,null,2));
