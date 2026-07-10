const { makeId, now } = require('../services/id');
const {
  normalizeReviewSiteInput,
  normalizeReviewCampaignInput,
  normalizeReviewRequestInput,
  normalizeReviewCaptureInput,
  summarizeReputation,
  markReviewResponded,
  escalateReview
} = require('../services/reputationService');

function createReputationRepository(store) {
  if (store.type === 'json') return createJsonReputationRepository(store);
  if (store.type === 'postgres') return createPostgresReputationRepository(store);
  throw new Error(`Unsupported store type: ${store.type}`);
}

function ensureReputation(data) {
  if (!data.reviewSites) data.reviewSites = [];
  if (!data.reviewCampaigns) data.reviewCampaigns = [];
  if (!data.reviewRequests) data.reviewRequests = [];
  if (!data.reviewCaptures) data.reviewCaptures = [];
  return data;
}

function createJsonReputationRepository(store) {
  return {
    listSites(tenantId) {
      return ensureReputation(store.read()).reviewSites.filter(x => x.tenantId === tenantId).sort((a, b) => Number(a.priority || 100) - Number(b.priority || 100));
    },
    createSite(tenantId, input) {
      const data = ensureReputation(store.read());
      const site = { id: makeId('revsite'), tenantId, ...normalizeReviewSiteInput(input), createdAt: now(), updatedAt: now() };
      data.reviewSites.push(site);
      store.write(data);
      return site;
    },
    listCampaigns(tenantId) {
      return ensureReputation(store.read()).reviewCampaigns.filter(x => x.tenantId === tenantId);
    },
    createCampaign(tenantId, input) {
      const data = ensureReputation(store.read());
      const campaign = { id: makeId('revcamp'), tenantId, ...normalizeReviewCampaignInput(input), createdAt: now(), updatedAt: now() };
      data.reviewCampaigns.push(campaign);
      store.write(data);
      return campaign;
    },
    listRequests(tenantId, filters = {}) {
      return ensureReputation(store.read()).reviewRequests
        .filter(x => x.tenantId === tenantId)
        .filter(x => !filters.customerId || x.customerId === filters.customerId)
        .filter(x => !filters.jobId || x.jobId === filters.jobId)
        .filter(x => !filters.status || x.status === filters.status)
        .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
    },
    createRequest(tenantId, input) {
      const data = ensureReputation(store.read());
      const request = { id: makeId('revreq'), tenantId, ...normalizeReviewRequestInput(input), createdAt: now(), updatedAt: now() };
      data.reviewRequests.push(request);
      store.write(data);
      return request;
    },
    markRequestSent(tenantId, id, sentAt) {
      const data = ensureReputation(store.read());
      const idx = data.reviewRequests.findIndex(x => x.tenantId === tenantId && x.id === id);
      if (idx === -1) return null;
      data.reviewRequests[idx] = { ...data.reviewRequests[idx], status: 'sent', sentAt: sentAt || now(), updatedAt: now() };
      store.write(data);
      return data.reviewRequests[idx];
    },
    listCaptures(tenantId, filters = {}) {
      return ensureReputation(store.read()).reviewCaptures
        .filter(x => x.tenantId === tenantId)
        .filter(x => !filters.customerId || x.customerId === filters.customerId)
        .filter(x => !filters.jobId || x.jobId === filters.jobId)
        .filter(x => !filters.platform || x.platform === filters.platform)
        .filter(x => !filters.status || x.status === filters.status)
        .sort((a, b) => String(b.receivedAt).localeCompare(String(a.receivedAt)));
    },
    findCaptureById(tenantId, id) {
      return ensureReputation(store.read()).reviewCaptures.find(x => x.tenantId === tenantId && x.id === id) || null;
    },
    createCapture(tenantId, input) {
      const data = ensureReputation(store.read());
      const capture = { id: makeId('revcap'), tenantId, ...normalizeReviewCaptureInput(input), createdAt: now(), updatedAt: now() };
      data.reviewCaptures.push(capture);
      store.write(data);
      return capture;
    },
    markResponded(tenantId, id, responseText) {
      const data = ensureReputation(store.read());
      const idx = data.reviewCaptures.findIndex(x => x.tenantId === tenantId && x.id === id);
      if (idx === -1) return null;
      data.reviewCaptures[idx] = markReviewResponded(data.reviewCaptures[idx], responseText);
      store.write(data);
      return data.reviewCaptures[idx];
    },
    escalate(tenantId, id, reason) {
      const data = ensureReputation(store.read());
      const idx = data.reviewCaptures.findIndex(x => x.tenantId === tenantId && x.id === id);
      if (idx === -1) return null;
      data.reviewCaptures[idx] = escalateReview(data.reviewCaptures[idx], reason);
      store.write(data);
      return data.reviewCaptures[idx];
    },
    summary(tenantId, filters = {}) {
      return summarizeReputation(this.listCaptures(tenantId, filters));
    }
  };
}

function createPostgresReputationRepository(store) {
  const siteSelect = `SELECT id::text, tenant_id as "tenantId", code, name, platform, review_url as "reviewUrl",
    active, priority, metadata, created_at as "createdAt", updated_at as "updatedAt" FROM review_sites`;
  const campaignSelect = `SELECT id::text, tenant_id as "tenantId", code, name, description, trigger_type as "triggerType",
    min_survey_rating::float as "minSurveyRating", min_nps_score as "minNpsScore",
    suppress_below_rating::float as "suppressBelowRating", active, metadata,
    created_at as "createdAt", updated_at as "updatedAt" FROM review_campaigns`;
  const requestSelect = `SELECT id::text, tenant_id as "tenantId", customer_id::text as "customerId",
    job_id::text as "jobId", survey_response_id::text as "surveyResponseId", review_site_id::text as "reviewSiteId",
    campaign_id::text as "campaignId", status, token, email, phone, sent_at as "sentAt",
    clicked_at as "clickedAt", completed_at as "completedAt", suppressed_reason as "suppressedReason",
    metadata, created_at as "createdAt", updated_at as "updatedAt" FROM review_requests`;
  const captureSelect = `SELECT id::text, tenant_id as "tenantId", customer_id::text as "customerId",
    job_id::text as "jobId", review_request_id::text as "reviewRequestId", platform, external_review_id as "externalReviewId",
    rating::float, sentiment, status, title, body, review_url as "reviewUrl", received_at as "receivedAt",
    response_text as "responseText", responded_at as "respondedAt", escalated_at as "escalatedAt",
    escalation_reason as "escalationReason", metadata, created_at as "createdAt", updated_at as "updatedAt"
    FROM review_captures`;

  return {
    async listSites(tenantId) {
      const result = await store.query(`${siteSelect} WHERE tenant_id = $1 ORDER BY priority, name`, [tenantId]);
      return result.rows;
    },
    async createSite(tenantId, input) {
      const x = normalizeReviewSiteInput(input);
      const result = await store.query(
        `INSERT INTO review_sites (tenant_id, code, name, platform, review_url, active, priority, metadata)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8::jsonb)
         RETURNING id::text, tenant_id as "tenantId", code, name, platform, review_url as "reviewUrl",
                   active, priority, metadata, created_at as "createdAt", updated_at as "updatedAt"`,
        [tenantId, x.code, x.name, x.platform, x.reviewUrl, x.active, x.priority, JSON.stringify(x.metadata || {})]
      );
      return result.rows[0];
    },
    async listCampaigns(tenantId) {
      const result = await store.query(`${campaignSelect} WHERE tenant_id = $1 ORDER BY name`, [tenantId]);
      return result.rows;
    },
    async createCampaign(tenantId, input) {
      const x = normalizeReviewCampaignInput(input);
      const result = await store.query(
        `INSERT INTO review_campaigns
         (tenant_id, code, name, description, trigger_type, min_survey_rating, min_nps_score, suppress_below_rating, active, metadata)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10::jsonb)
         RETURNING id::text, tenant_id as "tenantId", code, name, description, trigger_type as "triggerType",
                   min_survey_rating::float as "minSurveyRating", min_nps_score as "minNpsScore",
                   suppress_below_rating::float as "suppressBelowRating", active, metadata,
                   created_at as "createdAt", updated_at as "updatedAt"`,
        [tenantId, x.code, x.name, x.description, x.triggerType, x.minSurveyRating, x.minNpsScore,
          x.suppressBelowRating, x.active, JSON.stringify(x.metadata || {})]
      );
      return result.rows[0];
    },
    async listRequests(tenantId, filters = {}) {
      const params = [tenantId];
      let where = 'WHERE tenant_id = $1';
      const map = { customerId: 'customer_id', jobId: 'job_id', status: 'status' };
      for (const [key, column] of Object.entries(map)) {
        if (filters[key]) {
          params.push(filters[key]);
          where += ` AND ${column} = $${params.length}`;
        }
      }
      const result = await store.query(`${requestSelect} ${where} ORDER BY created_at DESC`, params);
      return result.rows;
    },
    async createRequest(tenantId, input) {
      const x = normalizeReviewRequestInput(input);
      const result = await store.query(
        `INSERT INTO review_requests
         (tenant_id, customer_id, job_id, survey_response_id, review_site_id, campaign_id, status, token, email,
          phone, sent_at, clicked_at, completed_at, suppressed_reason, metadata)
         VALUES ($1,$2::uuid,NULLIF($3,'')::uuid,NULLIF($4,'')::uuid,$5::uuid,NULLIF($6,'')::uuid,$7,$8,$9,$10,
                 NULLIF($11,'')::timestamptz,NULLIF($12,'')::timestamptz,NULLIF($13,'')::timestamptz,$14,$15::jsonb)
         RETURNING id::text, tenant_id as "tenantId", customer_id::text as "customerId",
                   job_id::text as "jobId", survey_response_id::text as "surveyResponseId", review_site_id::text as "reviewSiteId",
                   campaign_id::text as "campaignId", status, token, email, phone, sent_at as "sentAt",
                   clicked_at as "clickedAt", completed_at as "completedAt", suppressed_reason as "suppressedReason",
                   metadata, created_at as "createdAt", updated_at as "updatedAt"`,
        [tenantId, x.customerId, x.jobId, x.surveyResponseId, x.reviewSiteId, x.campaignId, x.status, x.token,
          x.email, x.phone, x.sentAt, x.clickedAt, x.completedAt, x.suppressedReason, JSON.stringify(x.metadata || {})]
      );
      return result.rows[0];
    },
    async markRequestSent(tenantId, id, sentAt) {
      const result = await store.query(
        `UPDATE review_requests SET status='sent', sent_at=$3::timestamptz, updated_at=now()
         WHERE tenant_id=$1 AND id=$2 RETURNING id::text, tenant_id as "tenantId", customer_id::text as "customerId",
         job_id::text as "jobId", survey_response_id::text as "surveyResponseId", review_site_id::text as "reviewSiteId",
         campaign_id::text as "campaignId", status, token, email, phone, sent_at as "sentAt",
         clicked_at as "clickedAt", completed_at as "completedAt", suppressed_reason as "suppressedReason",
         metadata, created_at as "createdAt", updated_at as "updatedAt"`,
        [tenantId, id, sentAt || new Date().toISOString()]
      );
      return result.rows[0] || null;
    },
    async listCaptures(tenantId, filters = {}) {
      const params = [tenantId];
      let where = 'WHERE tenant_id = $1';
      const map = { customerId: 'customer_id', jobId: 'job_id', platform: 'platform', status: 'status' };
      for (const [key, column] of Object.entries(map)) {
        if (filters[key]) {
          params.push(filters[key]);
          where += ` AND ${column} = $${params.length}`;
        }
      }
      const result = await store.query(`${captureSelect} ${where} ORDER BY received_at DESC`, params);
      return result.rows;
    },
    async findCaptureById(tenantId, id) {
      const result = await store.query(`${captureSelect} WHERE tenant_id = $1 AND id = $2 LIMIT 1`, [tenantId, id]);
      return result.rows[0] || null;
    },
    async createCapture(tenantId, input) {
      const x = normalizeReviewCaptureInput(input);
      const result = await store.query(
        `INSERT INTO review_captures
         (tenant_id, customer_id, job_id, review_request_id, platform, external_review_id, rating, sentiment,
          status, title, body, review_url, received_at, response_text, responded_at, escalated_at, escalation_reason, metadata)
         VALUES ($1,$2::uuid,NULLIF($3,'')::uuid,NULLIF($4,'')::uuid,$5,$6,$7,$8,$9,$10,$11,$12,$13::timestamptz,$14,
                 NULLIF($15,'')::timestamptz,NULLIF($16,'')::timestamptz,$17,$18::jsonb)
         RETURNING id::text, tenant_id as "tenantId", customer_id::text as "customerId",
                   job_id::text as "jobId", review_request_id::text as "reviewRequestId", platform, external_review_id as "externalReviewId",
                   rating::float, sentiment, status, title, body, review_url as "reviewUrl", received_at as "receivedAt",
                   response_text as "responseText", responded_at as "respondedAt", escalated_at as "escalatedAt",
                   escalation_reason as "escalationReason", metadata, created_at as "createdAt", updated_at as "updatedAt"`,
        [tenantId, x.customerId, x.jobId, x.reviewRequestId, x.platform, x.externalReviewId, x.rating, x.sentiment,
          x.status, x.title, x.body, x.reviewUrl, x.receivedAt, x.responseText, x.respondedAt, x.escalatedAt,
          x.escalationReason, JSON.stringify(x.metadata || {})]
      );
      return result.rows[0];
    },
    async markResponded(tenantId, id, responseText) {
      const result = await store.query(
        `UPDATE review_captures SET status='responded', response_text=$3, responded_at=now(), updated_at=now()
         WHERE tenant_id=$1 AND id=$2 RETURNING *`,
        [tenantId, id, responseText]
      );
      return result.rows[0] ? this.findCaptureById(tenantId, id) : null;
    },
    async escalate(tenantId, id, reason) {
      const result = await store.query(
        `UPDATE review_captures SET status='escalated', escalation_reason=$3, escalated_at=now(), updated_at=now()
         WHERE tenant_id=$1 AND id=$2 RETURNING *`,
        [tenantId, id, reason]
      );
      return result.rows[0] ? this.findCaptureById(tenantId, id) : null;
    },
    async summary(tenantId, filters = {}) {
      const rows = await this.listCaptures(tenantId, filters);
      return summarizeReputation(rows);
    }
  };
}

module.exports = { createReputationRepository };
