const crypto = require('crypto');
const { validationError } = require('../errors/domainError');

const REVIEW_PLATFORMS = ['google', 'facebook', 'yelp', 'bbb', 'angi', 'homeadvisor', 'custom'];
const REVIEW_REQUEST_STATUSES = ['draft', 'queued', 'sent', 'clicked', 'completed', 'suppressed', 'void'];
const REVIEW_CAPTURE_STATUSES = ['new', 'acknowledged', 'responded', 'escalated', 'closed'];
const SENTIMENTS = ['positive', 'neutral', 'negative'];

function makeReviewToken() {
  return crypto.randomBytes(16).toString('hex');
}

function normalizeReviewSiteInput(input = {}) {
  if (!input.name) throw validationError('name is required');
  const platform = input.platform || 'custom';
  if (!REVIEW_PLATFORMS.includes(platform)) throw validationError(`Unsupported review platform: ${platform}`);
  if (!input.reviewUrl) throw validationError('reviewUrl is required');

  return {
    code: input.code || String(input.name).toUpperCase().replace(/[^A-Z0-9]+/g, '-').replace(/^-|-$/g, ''),
    name: input.name,
    platform,
    reviewUrl: input.reviewUrl,
    active: input.active !== false,
    priority: Number(input.priority || 100),
    metadata: input.metadata || {}
  };
}

function normalizeReviewCampaignInput(input = {}) {
  if (!input.name) throw validationError('name is required');
  return {
    code: input.code || String(input.name).toUpperCase().replace(/[^A-Z0-9]+/g, '-').replace(/^-|-$/g, ''),
    name: input.name,
    description: input.description || '',
    triggerType: input.triggerType || 'survey.promoter',
    minSurveyRating: Number(input.minSurveyRating || 4),
    minNpsScore: Number(input.minNpsScore || 9),
    suppressBelowRating: Number(input.suppressBelowRating || 4),
    active: input.active !== false,
    metadata: input.metadata || {}
  };
}

function normalizeReviewRequestInput(input = {}) {
  if (!input.customerId) throw validationError('customerId is required');
  if (!input.reviewSiteId) throw validationError('reviewSiteId is required');

  const status = input.status || 'queued';
  if (!REVIEW_REQUEST_STATUSES.includes(status)) throw validationError(`Unsupported review request status: ${status}`);

  return {
    customerId: input.customerId,
    jobId: input.jobId || '',
    surveyResponseId: input.surveyResponseId || '',
    reviewSiteId: input.reviewSiteId,
    campaignId: input.campaignId || '',
    status,
    token: input.token || makeReviewToken(),
    email: input.email || '',
    phone: input.phone || '',
    sentAt: input.sentAt || '',
    clickedAt: input.clickedAt || '',
    completedAt: input.completedAt || '',
    suppressedReason: input.suppressedReason || '',
    metadata: input.metadata || {}
  };
}

function normalizeReviewCaptureInput(input = {}) {
  if (!input.customerId) throw validationError('customerId is required');
  if (!input.platform) throw validationError('platform is required');

  const platform = input.platform;
  if (!REVIEW_PLATFORMS.includes(platform)) throw validationError(`Unsupported review platform: ${platform}`);

  const rating = Number(input.rating || 0);
  const sentiment = input.sentiment || classifyRating(rating);
  if (!SENTIMENTS.includes(sentiment)) throw validationError(`Unsupported review sentiment: ${sentiment}`);

  const status = input.status || 'new';
  if (!REVIEW_CAPTURE_STATUSES.includes(status)) throw validationError(`Unsupported review capture status: ${status}`);

  return {
    customerId: input.customerId,
    jobId: input.jobId || '',
    reviewRequestId: input.reviewRequestId || '',
    platform,
    externalReviewId: input.externalReviewId || '',
    rating,
    sentiment,
    status,
    title: input.title || '',
    body: input.body || '',
    reviewUrl: input.reviewUrl || '',
    receivedAt: input.receivedAt || new Date().toISOString(),
    responseText: input.responseText || '',
    respondedAt: input.respondedAt || '',
    escalatedAt: input.escalatedAt || '',
    escalationReason: input.escalationReason || '',
    metadata: input.metadata || {}
  };
}

function classifyRating(rating) {
  const n = Number(rating || 0);
  if (n >= 4) return 'positive';
  if (n >= 3) return 'neutral';
  return 'negative';
}

function shouldSendReviewRequest(campaign, surveyResult = {}) {
  if (!campaign || campaign.active === false) return { send: false, reason: 'Campaign inactive' };
  const csat = Number(surveyResult.csatScore || 0);
  const nps = surveyResult.npsScore === null || surveyResult.npsScore === undefined ? null : Number(surveyResult.npsScore);

  if (csat && csat < Number(campaign.suppressBelowRating || 4)) {
    return { send: false, reason: 'Survey rating below review threshold' };
  }
  if (nps !== null && nps < Number(campaign.minNpsScore || 9)) {
    return { send: false, reason: 'NPS below promoter threshold' };
  }
  if (csat >= Number(campaign.minSurveyRating || 4) || nps >= Number(campaign.minNpsScore || 9)) {
    return { send: true, reason: 'Customer is eligible for review request' };
  }
  return { send: false, reason: 'Survey result does not qualify' };
}

function summarizeReputation(captures = []) {
  const count = captures.length;
  const ratingRows = captures.filter(x => Number(x.rating || 0) > 0);
  const averageRating = ratingRows.length
    ? Math.round((ratingRows.reduce((sum, x) => sum + Number(x.rating || 0), 0) / ratingRows.length) * 100) / 100
    : 0;
  return {
    reviewCount: count,
    averageRating,
    positiveCount: captures.filter(x => classifyRating(x.rating) === 'positive').length,
    neutralCount: captures.filter(x => classifyRating(x.rating) === 'neutral').length,
    negativeCount: captures.filter(x => classifyRating(x.rating) === 'negative').length,
    escalationCount: captures.filter(x => x.status === 'escalated').length
  };
}

function markReviewResponded(capture, responseText, respondedAt = new Date().toISOString()) {
  if (!responseText) throw validationError('responseText is required');
  return {
    ...capture,
    status: 'responded',
    responseText,
    respondedAt,
    updatedAt: respondedAt
  };
}

function escalateReview(capture, reason, escalatedAt = new Date().toISOString()) {
  if (!reason) throw validationError('escalation reason is required');
  return {
    ...capture,
    status: 'escalated',
    escalatedAt,
    escalationReason: reason,
    updatedAt: escalatedAt
  };
}

module.exports = {
  REVIEW_PLATFORMS,
  REVIEW_REQUEST_STATUSES,
  REVIEW_CAPTURE_STATUSES,
  SENTIMENTS,
  makeReviewToken,
  normalizeReviewSiteInput,
  normalizeReviewCampaignInput,
  normalizeReviewRequestInput,
  normalizeReviewCaptureInput,
  classifyRating,
  shouldSendReviewRequest,
  summarizeReputation,
  markReviewResponded,
  escalateReview
};
