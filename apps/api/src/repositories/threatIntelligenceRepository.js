const { makeId, now } = require('../services/id');
const svc = require('../services/threatIntelligenceService');

function createThreatIntelligenceRepository(store) {
  if (store.type === 'json') return createJsonThreatIntelligenceRepository(store);
  if (store.type === 'postgres') return createPostgresThreatIntelligenceRepository();
  throw new Error(`Unsupported store type: ${store.type}`);
}
function ensureTi(data) {
  data.threatFeeds ||= []; data.threatIndicators ||= []; data.threatActors ||= []; data.threatCampaigns ||= [];
  data.threatSightings ||= []; data.threatEnrichments ||= []; data.threatWatchlists ||= [];
  return data;
}
function updateById(rows, id, fn) { const idx = rows.findIndex(x => x.id === id); if (idx === -1) return null; rows[idx] = fn(rows[idx]); return rows[idx]; }
function createJsonThreatIntelligenceRepository(store) {
  return {
    createFeed(input) { const data = ensureTi(store.read()); const row = { id: makeId('tifeed'), ...svc.normalizeFeedInput(input), createdAt: now(), updatedAt: now() }; data.threatFeeds.push(row); store.write(data); return row; },
    listFeeds(filters = {}) { return ensureTi(store.read()).threatFeeds.filter(x => !filters.tenantId || x.tenantId === filters.tenantId).filter(x => !filters.status || x.status === filters.status); },
    pauseFeed(id) { const data = ensureTi(store.read()); const row = updateById(data.threatFeeds, id, svc.pauseFeed); store.write(data); return row; },
    activateFeed(id) { const data = ensureTi(store.read()); const row = updateById(data.threatFeeds, id, svc.activateFeed); store.write(data); return row; },
    createIndicator(input) { const data = ensureTi(store.read()); const row = { id: makeId('tiind'), ...svc.normalizeIndicatorInput(input), createdAt: now(), updatedAt: now() }; data.threatIndicators.push(row); store.write(data); return row; },
    listIndicators(filters = {}) { return ensureTi(store.read()).threatIndicators.filter(x => !filters.tenantId || x.tenantId === filters.tenantId).filter(x => !filters.indicatorType || x.indicatorType === filters.indicatorType).filter(x => !filters.severity || x.severity === filters.severity).sort((a,b)=>svc.riskScore(b)-svc.riskScore(a)); },
    refreshIndicator(id) { const data = ensureTi(store.read()); const row = updateById(data.threatIndicators, id, svc.refreshIndicator); store.write(data); return row; },
    createActor(input) { const data = ensureTi(store.read()); const row = { id: makeId('tiactor'), ...svc.normalizeActorInput(input), createdAt: now(), updatedAt: now() }; data.threatActors.push(row); store.write(data); return row; },
    listActors(filters = {}) { return ensureTi(store.read()).threatActors.filter(x => !filters.tenantId || x.tenantId === filters.tenantId).filter(x => !filters.status || x.status === filters.status); },
    createCampaign(input) { const data = ensureTi(store.read()); const row = { id: makeId('ticamp'), ...svc.normalizeCampaignInput(input), createdAt: now(), updatedAt: now() }; data.threatCampaigns.push(row); store.write(data); return row; },
    activateCampaign(id) { const data = ensureTi(store.read()); const row = updateById(data.threatCampaigns, id, svc.activateCampaign); store.write(data); return row; },
    createSighting(input) { const data = ensureTi(store.read()); const row = { id: makeId('tisight'), ...svc.normalizeSightingInput(input), createdAt: now(), updatedAt: now() }; data.threatSightings.push(row); const idx = data.threatIndicators.findIndex(x => x.id === row.indicatorId); if (idx !== -1) data.threatIndicators[idx] = svc.refreshIndicator(data.threatIndicators[idx], row.observedAt); store.write(data); return row; },
    listSightings(filters = {}) { return ensureTi(store.read()).threatSightings.filter(x => !filters.tenantId || x.tenantId === filters.tenantId).filter(x => !filters.indicatorId || x.indicatorId === filters.indicatorId); },
    createEnrichment(input) { const data = ensureTi(store.read()); const row = { id: makeId('tienrich'), ...svc.normalizeEnrichmentInput(input), createdAt: now(), updatedAt: now() }; data.threatEnrichments.push(row); store.write(data); return row; },
    completeEnrichment(id, result = {}, score = null) { const data = ensureTi(store.read()); const row = updateById(data.threatEnrichments, id, x => svc.completeEnrichment(x, result, score)); store.write(data); return row; },
    failEnrichment(id, errorMessage = '') { const data = ensureTi(store.read()); const row = updateById(data.threatEnrichments, id, x => svc.failEnrichment(x, errorMessage)); store.write(data); return row; },
    createWatchlist(input) { const data = ensureTi(store.read()); const row = { id: makeId('tiwatch'), ...svc.normalizeWatchlistInput(input), createdAt: now(), updatedAt: now() }; data.threatWatchlists.push(row); store.write(data); return row; },
    retireWatchlist(id) { const data = ensureTi(store.read()); const row = updateById(data.threatWatchlists, id, svc.retireWatchlist); store.write(data); return row; },
    metrics(tenantId) { const data = ensureTi(store.read()); return svc.threatIntelMetrics({ feeds: data.threatFeeds.filter(x => !tenantId || x.tenantId === tenantId), indicators: data.threatIndicators.filter(x => !tenantId || x.tenantId === tenantId), actors: data.threatActors.filter(x => !tenantId || x.tenantId === tenantId), campaigns: data.threatCampaigns.filter(x => !tenantId || x.tenantId === tenantId), sightings: data.threatSightings.filter(x => !tenantId || x.tenantId === tenantId), watchlists: data.threatWatchlists.filter(x => !tenantId || x.tenantId === tenantId) }); }
  };
}
function createPostgresThreatIntelligenceRepository() {
  return {
    async createFeed(input) { return { id: 'postgres-feed-placeholder', ...svc.normalizeFeedInput(input) }; }, async listFeeds() { return []; }, async pauseFeed() { return null; }, async activateFeed() { return null; },
    async createIndicator(input) { return { id: 'postgres-indicator-placeholder', ...svc.normalizeIndicatorInput(input) }; }, async listIndicators() { return []; }, async refreshIndicator() { return null; },
    async createActor(input) { return { id: 'postgres-actor-placeholder', ...svc.normalizeActorInput(input) }; }, async listActors() { return []; },
    async createCampaign(input) { return { id: 'postgres-campaign-placeholder', ...svc.normalizeCampaignInput(input) }; }, async activateCampaign() { return null; },
    async createSighting(input) { return { id: 'postgres-sighting-placeholder', ...svc.normalizeSightingInput(input) }; }, async listSightings() { return []; },
    async createEnrichment(input) { return { id: 'postgres-enrichment-placeholder', ...svc.normalizeEnrichmentInput(input) }; }, async completeEnrichment() { return null; }, async failEnrichment() { return null; },
    async createWatchlist(input) { return { id: 'postgres-watchlist-placeholder', ...svc.normalizeWatchlistInput(input) }; }, async retireWatchlist() { return null; },
    async metrics() { return svc.threatIntelMetrics({}); }
  };
}
module.exports = { createThreatIntelligenceRepository };
