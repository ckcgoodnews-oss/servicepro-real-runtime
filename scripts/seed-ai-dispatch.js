const { getRepositories, resetRepositoriesForTest } = require('../apps/api/src/repositories/repositoryFactory');
async function main() {
  resetRepositoriesForTest(); const repos=getRepositories(); const tenantId=process.env.DEFAULT_TENANT_ID||'tenant_demo';
  const recommendation = await repos.aiDispatch.generateRecommendation(tenantId, { jobId:'job_demo_1', customerId:'cust_demo_1', priority:'urgent', territoryId:'territory_demo_1', requiredSkills:['hvac','diagnostics'], candidateLimit:3, candidates:[{technicianId:'tech_demo_1',displayName:'Demo Technician',territoryIds:['territory_demo_1'],skillTags:['hvac','diagnostics','electrical'],available:true,currentRouteStops:2,openJobCount:1,sameCustomerHistoryCount:2},{technicianId:'tech_demo_2',displayName:'Backup Technician',territoryIds:['territory_demo_2'],skillTags:['plumbing'],available:true,currentRouteStops:1}] });
  if (repos.store.close) await repos.store.close(); console.log(JSON.stringify({ok:true,tenantId,recommendation},null,2));
}
main().catch(err=>{ console.error(err); process.exit(1); });
