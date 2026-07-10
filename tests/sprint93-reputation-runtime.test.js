const fs = require('fs');

const required = [
  'apps/api/src/services/reputationService.js',
  'apps/api/src/repositories/reputationRepository.js',
  'apps/api/src/routes/reputation.js',
  'scripts/seed-reputation.js',
  'packages/database/postgres/093_reputation_runtime.sql',
  'docs/sprint93-reputation-runtime.md'
];

for (const file of required) {
  if (!fs.existsSync(file)) {
    console.error(`Missing required Sprint 93 patch file: ${file}`);
    process.exit(1);
  }
}

const {
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
} = require('../apps/api/src/services/reputationService');

if (makeReviewToken().length !== 32) {
  console.error('Review token generation failed.');
  process.exit(1);
}

const site = normalizeReviewSiteInput({ name: 'Google', platform: 'google', reviewUrl: 'https://example.com/review' });
if (site.platform !== 'google') {
  console.error('Review site normalization failed.');
  process.exit(1);
}

const campaign = normalizeReviewCampaignInput({ name: 'Promoter Request', minNpsScore: 9 });
const eligibility = shouldSendReviewRequest(campaign, { csatScore: 5, npsScore: 10 });
if (!eligibility.send) {
  console.error('Review request eligibility failed.');
  process.exit(1);
}

const request = normalizeReviewRequestInput({ customerId: 'cust1', reviewSiteId: 'site1' });
if (!request.token || request.status !== 'queued') {
  console.error('Review request normalization failed.');
  process.exit(1);
}

const capture = normalizeReviewCaptureInput({ customerId: 'cust1', platform: 'google', rating: 2, body: 'Poor experience' });
if (capture.sentiment !== 'negative' || classifyRating(5) !== 'positive') {
  console.error('Review capture classification failed.');
  process.exit(1);
}

const escalated = escalateReview(capture, 'Negative review');
if (escalated.status !== 'escalated') {
  console.error('Review escalation failed.');
  process.exit(1);
}

const responded = markReviewResponded(capture, 'We are sorry and will follow up.');
if (responded.status !== 'responded') {
  console.error('Review response marker failed.');
  process.exit(1);
}

const summary = summarizeReputation([{ rating: 5 }, { rating: 3 }, { rating: 1, status: 'escalated' }]);
if (summary.averageRating !== 3 || summary.escalationCount !== 1) {
  console.error('Reputation summary failed.');
  process.exit(1);
}

console.log('Sprint 93 reputation runtime patch test passed.');
