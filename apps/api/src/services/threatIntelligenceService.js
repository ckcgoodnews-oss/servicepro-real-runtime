const { validationError } = require('../errors/domainError');

const FEED_STATUSES = ['active', 'paused', 'retired'];
const INDICATOR_TYPES = ['ip', 'domain', 'url', 'hash', 'email', 'user_agent', 'mutex', 'other'];
const CONFIDENCE_LEVELS = ['low', 'medium', 'high', 'confirmed'];
const SEVERITIES = ['low', 'medium', 'high', 'critical'];
const ACTOR_STATUSES = ['tracked', 'inactive', 'retired'];
const CAMPAIGN_STATUSES = ['active', 'watching', 'inactive', 'retired'];
const SIGHTING_SOURCES = ['siem', 'edr', 'firewall', 'email_gateway', 'proxy', 'manual', 'other'];
const ENRICHMENT_STATUSES = ['queued', 'completed', 'failed'];
const WATCHLIST_STATUSES = ['active', 'paused', 'retired'];

function assertAllowed(value, allowed, label) { if (!allowed.includes(value)) throw validationError(`Unsupported ${label}: ${value}`); }
function slugCode(value = '') { return String(value).toUpperCase().replace(/[^A-Z0-9]+/g, '-').replace(/^-|-$/g, ''); }
function addDays(dateText, days) { const base = new Date(dateText || new Date().toISOString()); base.setUTCDate(base.getUTCDate() + Number(days || 0)); return base.toISOString(); }
function normalizeIndicatorValue(type, value) { const text = String(value || '').trim(); return ['domain','email','url'].includes(type) ? text.toLowerCase() : text; }
function defaultExpiry(type) { return addDays(new Date().toISOString(), type === 'ip' ? 30 : type === 'domain' ? 90 : type === 'hash' ? 180 : 60); }
function confidenceRank(v) { return { low: 1, medium: 2, high: 3, confirmed: 4 }[v] || 0; }
function severityRank(v) { return { low: 1, medium: 2, high: 3, critical: 4 }[v] || 0; }

function normalizeFeedInput(input = {}) {
  if (!input.tenantId) throw validationError('tenantId is required');
  if (!input.name) throw validationError('name is required');
  const status = input.status || 'active'; assertAllowed(status, FEED_STATUSES, 'feed status');
  return { tenantId: input.tenantId, code: input.code || slugCode(input.name), name: input.name, description: input.description || '', status, sourceUrl: input.sourceUrl || '', owner: input.owner || '', trustLevel: input.trustLevel || 'medium', lastIngestedAt: input.lastIngestedAt || '', metadata: input.metadata || {} };
}
function normalizeIndicatorInput(input = {}) {
  if (!input.tenantId) throw validationError('tenantId is required');
  if (!input.value) throw validationError('value is required');
  const indicatorType = input.indicatorType || 'other', confidence = input.confidence || 'medium', severity = input.severity || 'medium';
  assertAllowed(indicatorType, INDICATOR_TYPES, 'indicator type'); assertAllowed(confidence, CONFIDENCE_LEVELS, 'confidence'); assertAllowed(severity, SEVERITIES, 'severity');
  return { tenantId: input.tenantId, feedId: input.feedId || '', value: input.value, normalizedValue: normalizeIndicatorValue(indicatorType, input.value), indicatorType, confidence, severity, firstSeenAt: input.firstSeenAt || new Date().toISOString(), lastSeenAt: input.lastSeenAt || input.firstSeenAt || new Date().toISOString(), expiresAt: input.expiresAt || defaultExpiry(indicatorType), tags: Array.isArray(input.tags) ? input.tags : [], description: input.description || '', metadata: input.metadata || {} };
}
function normalizeActorInput(input = {}) {
  if (!input.tenantId) throw validationError('tenantId is required');
  if (!input.name) throw validationError('name is required');
  const status = input.status || 'tracked'; assertAllowed(status, ACTOR_STATUSES, 'actor status');
  return { tenantId: input.tenantId, name: input.name, aliases: Array.isArray(input.aliases) ? input.aliases : [], status, motivation: input.motivation || '', regions: Array.isArray(input.regions) ? input.regions : [], sectors: Array.isArray(input.sectors) ? input.sectors : [], description: input.description || '', metadata: input.metadata || {} };
}
function normalizeCampaignInput(input = {}) {
  if (!input.tenantId) throw validationError('tenantId is required');
  if (!input.name) throw validationError('name is required');
  const status = input.status || 'watching', severity = input.severity || 'medium';
  assertAllowed(status, CAMPAIGN_STATUSES, 'campaign status'); assertAllowed(severity, SEVERITIES, 'campaign severity');
  return { tenantId: input.tenantId, actorId: input.actorId || '', name: input.name, status, severity, startedAt: input.startedAt || new Date().toISOString(), endedAt: input.endedAt || '', objective: input.objective || '', techniques: Array.isArray(input.techniques) ? input.techniques : [], metadata: input.metadata || {} };
}
function normalizeSightingInput(input = {}) {
  if (!input.tenantId) throw validationError('tenantId is required');
  if (!input.indicatorId) throw validationError('indicatorId is required');
  const source = input.source || 'manual'; assertAllowed(source, SIGHTING_SOURCES, 'sighting source');
  return { tenantId: input.tenantId, indicatorId: input.indicatorId, assetId: input.assetId || '', userId: input.userId || '', source, observedAt: input.observedAt || new Date().toISOString(), rawEventId: input.rawEventId || '', count: Number(input.count || 1), metadata: input.metadata || {} };
}
function normalizeEnrichmentInput(input = {}) {
  if (!input.tenantId) throw validationError('tenantId is required');
  if (!input.indicatorId) throw validationError('indicatorId is required');
  const status = input.status || 'queued'; assertAllowed(status, ENRICHMENT_STATUSES, 'enrichment status');
  return { tenantId: input.tenantId, indicatorId: input.indicatorId, provider: input.provider || '', status, requestedAt: input.requestedAt || new Date().toISOString(), completedAt: input.completedAt || '', score: input.score == null ? null : Number(input.score), result: input.result || {}, errorMessage: input.errorMessage || '', metadata: input.metadata || {} };
}
function normalizeWatchlistInput(input = {}) {
  if (!input.tenantId) throw validationError('tenantId is required');
  if (!input.name) throw validationError('name is required');
  const status = input.status || 'active'; assertAllowed(status, WATCHLIST_STATUSES, 'watchlist status');
  return { tenantId: input.tenantId, name: input.name, description: input.description || '', status, indicatorIds: Array.isArray(input.indicatorIds) ? input.indicatorIds : [], owner: input.owner || '', metadata: input.metadata || {} };
}
function riskScore(indicator = {}) { return severityRank(indicator.severity) * 10 + confidenceRank(indicator.confidence) * 5 + (indicator.tags || []).length; }
function isExpired(indicator, asOf = new Date().toISOString()) { return indicator.expiresAt && new Date(asOf).getTime() > new Date(indicator.expiresAt).getTime(); }
function refreshIndicator(indicator, at = new Date().toISOString()) { return { ...indicator, lastSeenAt: at, expiresAt: defaultExpiry(indicator.indicatorType), updatedAt: at }; }
function completeEnrichment(enrichment, result = {}, score = null, at = new Date().toISOString()) { return { ...enrichment, status: 'completed', result, score: score === null ? enrichment.score : Number(score), completedAt: at, updatedAt: at }; }
function failEnrichment(enrichment, errorMessage = '', at = new Date().toISOString()) { return { ...enrichment, status: 'failed', errorMessage: errorMessage || 'Enrichment failed', completedAt: at, updatedAt: at }; }
function pauseFeed(feed, at = new Date().toISOString()) { return { ...feed, status: 'paused', updatedAt: at }; }
function activateFeed(feed, at = new Date().toISOString()) { return { ...feed, status: 'active', updatedAt: at }; }
function activateCampaign(campaign, at = new Date().toISOString()) { return { ...campaign, status: 'active', updatedAt: at }; }
function retireWatchlist(watchlist, at = new Date().toISOString()) { return { ...watchlist, status: 'retired', updatedAt: at }; }
function threatIntelMetrics({ feeds = [], indicators = [], actors = [], campaigns = [], sightings = [], watchlists = [] }) {
  return { activeFeeds: feeds.filter(x => x.status === 'active').length, indicatorCount: indicators.length, criticalIndicators: indicators.filter(x => x.severity === 'critical').length, trackedActors: actors.filter(x => x.status === 'tracked').length, activeCampaigns: campaigns.filter(x => x.status === 'active').length, sightingsCount: sightings.reduce((sum, x) => sum + Number(x.count || 1), 0), activeWatchlists: watchlists.filter(x => x.status === 'active').length };
}
module.exports = { FEED_STATUSES, INDICATOR_TYPES, CONFIDENCE_LEVELS, SEVERITIES, ACTOR_STATUSES, CAMPAIGN_STATUSES, SIGHTING_SOURCES, ENRICHMENT_STATUSES, WATCHLIST_STATUSES, slugCode, addDays, normalizeFeedInput, normalizeIndicatorInput, normalizeActorInput, normalizeCampaignInput, normalizeSightingInput, normalizeEnrichmentInput, normalizeWatchlistInput, normalizeIndicatorValue, defaultExpiry, confidenceRank, severityRank, riskScore, isExpired, refreshIndicator, completeEnrichment, failEnrichment, pauseFeed, activateFeed, activateCampaign, retireWatchlist, threatIntelMetrics };
