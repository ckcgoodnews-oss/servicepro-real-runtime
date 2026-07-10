const { getRepositories, resetRepositoriesForTest } = require('../apps/api/src/repositories/repositoryFactory');
async function main() {
  resetRepositoriesForTest();
  const repos = getRepositories();
  const tenantId = process.env.DEFAULT_TENANT_ID || 'tenant_demo';
  const feed = await repos.threatIntelligence.createFeed({ tenantId, name: 'Demo Threat Feed', sourceUrl: 'https://intel.example/feed.json', owner: 'soc', trustLevel: 'high' });
  const indicator = await repos.threatIntelligence.createIndicator({ tenantId, feedId: feed.id, value: 'evil.example', indicatorType: 'domain', confidence: 'high', severity: 'critical', tags: ['phishing', 'credential-theft'] });
  const actor = await repos.threatIntelligence.createActor({ tenantId, name: 'Demo Actor', aliases: ['DA-1'], motivation: 'financial', sectors: ['field-service'] });
  const campaign = await repos.threatIntelligence.createCampaign({ tenantId, actorId: actor.id, name: 'Credential Harvesting Wave', severity: 'high', techniques: ['T1566', 'T1110'] });
  const activeCampaign = await repos.threatIntelligence.activateCampaign(campaign.id);
  const sighting = await repos.threatIntelligence.createSighting({ tenantId, indicatorId: indicator.id, assetId: 'asset_demo_prod_api_01', source: 'siem', count: 3 });
  const enrichment = await repos.threatIntelligence.createEnrichment({ tenantId, indicatorId: indicator.id, provider: 'demo-reputation' });
  const completedEnrichment = await repos.threatIntelligence.completeEnrichment(enrichment.id, { reputation: 'malicious' }, 95);
  const watchlist = await repos.threatIntelligence.createWatchlist({ tenantId, name: 'High Risk Domains', indicatorIds: [indicator.id], owner: 'soc' });
  const metrics = await repos.threatIntelligence.metrics(tenantId);
  if (repos.store.close) await repos.store.close();
  console.log(JSON.stringify({ ok: true, feed, indicator, actor, campaign: activeCampaign, sighting, enrichment: completedEnrichment, watchlist, metrics }, null, 2));
}
main().catch(err => { console.error(err); process.exit(1); });
