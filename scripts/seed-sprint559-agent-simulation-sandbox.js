const { getRepositories } = require('../apps/api/src/repositories/repositoryFactory');
const repo=getRepositories().phase35AgenticWorkforceOrchestration;
const row=repo.create({tenantId:process.env.DEFAULT_TENANT_ID||'tenant_demo',domain:'agent-simulation-sandbox',name:'Agent Simulation Sandbox',owner:'platform'});
console.log(JSON.stringify({ok:true,row},null,2));
