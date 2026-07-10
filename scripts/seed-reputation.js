const { getRepositories, resetRepositoriesForTest } = require('../apps/api/src/repositories/repositoryFactory');

async function main() {
  resetRepositoriesForTest();
  const repos = getRepositories();
  const tenantId = process.env.DEFAULT_TENANT_ID || 'tenant_demo';

  const site = await repos.reputation.createSite(tenantId, {
    name: 'Google Business Profile',
    platform: 'google',
    reviewUrl: 'https://example.com/review-us',
    priority: 10
  });

  const campaign = await repos.reputation.createCampaign(tenantId, {
    name: 'Promoter Review Request',
    triggerType: 'survey.promoter',
    minSurveyRating: 4,
    minNpsScore: 9
  });

  const request = await repos.reputation.createRequest(tenantId, {
    customerId: 'cust_demo_1',
    jobId: 'job_demo_1',
    reviewSiteId: site.id,
    campaignId: campaign.id,
    email: 'customer@example.com'
  });

  if (repos.store.close) await repos.store.close();
  console.log(JSON.stringify({ ok: true, tenantId, site, campaign, request }, null, 2));
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
