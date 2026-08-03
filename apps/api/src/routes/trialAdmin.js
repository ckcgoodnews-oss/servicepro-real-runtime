const { sendJson } = require('../utils/http');
const trialService = require('../services/trialService');

/**
 * GET /api/v1/platform/trials
 * List all trials. Platform admin only.
 */
async function listTrials(req, res) {
  const { status, industry } = req.query || {};
  const filters = {};
  if (status) filters.status = status;
  if (industry) filters.industry = industry;

  // Parse query string manually (no express)
  const url = new URL(req.url, 'http://localhost');
  if (url.searchParams.get('status')) filters.status = url.searchParams.get('status');
  if (url.searchParams.get('industry')) filters.industry = url.searchParams.get('industry');

  const trials = await req.context.repositories.trials.listAll(filters);

  const enriched = trials.map(t => ({
    id: t.id,
    tenantId: t.tenant_id || t.tenantId,
    email: t.email,
    name: t.name,
    companyName: t.company_name || t.companyName,
    industry: t.industry,
    plan: t.plan,
    status: trialService.trialStatus(t),
    daysRemaining: trialService.daysRemaining(t.expires_at || t.expiresAt),
    startedAt: t.started_at || t.startedAt,
    expiresAt: t.expires_at || t.expiresAt,
    source: t.source,
    campaign: t.campaign,
    createdAt: t.created_at || t.createdAt
  }));

  return sendJson(res, 200, { data: enriched, total: enriched.length });
}

/**
 * GET /api/v1/platform/trials/:trialId
 * Get single trial detail. Platform admin only.
 */
async function getTrialDetail(req, res, trialId) {
  const trials = await req.context.repositories.trials.listAll({});
  const trial = trials.find(t => t.id === trialId);
  if (!trial) return sendJson(res, 404, { error: { code: 'not_found', message: 'Trial not found' } });

  const onboardingSteps = await req.context.repositories.trials.getOnboardingSteps(trial.tenant_id || trial.tenantId);
  const completedSteps = onboardingSteps.filter(s => s.status === 'completed').length;

  return sendJson(res, 200, { data: {
    ...trial,
    computedStatus: trialService.trialStatus(trial),
    daysRemaining: trialService.daysRemaining(trial.expires_at || trial.expiresAt),
    onboarding: { completed: completedSteps, total: trialService.ONBOARDING_STEPS.length, steps: onboardingSteps }
  }});
}

/**
 * POST /api/v1/platform/trials/:trialId/extend
 * Extend trial duration. Platform admin only.
 */
async function extendTrial(req, res, trialId) {
  const { days } = req.body || {};
  if (!days || days < 1 || days > 90) return sendJson(res, 400, { error: { code: 'validation_failed', message: 'days must be between 1 and 90' } });

  const trials = await req.context.repositories.trials.listAll({});
  const trial = trials.find(t => t.id === trialId);
  if (!trial) return sendJson(res, 404, { error: { code: 'not_found', message: 'Trial not found' } });

  const currentExpiry = new Date(trial.expires_at || trial.expiresAt);
  const base = currentExpiry > new Date() ? currentExpiry : new Date();
  base.setUTCDate(base.getUTCDate() + Number(days));
  const newExpiresAt = base.toISOString();

  await req.context.repositories.trials.update(trialId, {
    expiresAt: newExpiresAt,
    status: 'active'
  });

  return sendJson(res, 200, { data: { extended: true, trialId, newExpiresAt, addedDays: days } });
}

/**
 * POST /api/v1/platform/trials/:trialId/cancel
 * Cancel a trial. Platform admin only.
 */
async function cancelTrial(req, res, trialId) {
  const { reason } = req.body || {};
  await req.context.repositories.trials.update(trialId, {
    cancelledAt: new Date().toISOString(),
    status: 'cancelled',
    metadata: reason ? JSON.stringify({ cancelReason: reason }) : undefined
  });
  return sendJson(res, 200, { data: { cancelled: true, trialId } });
}

/**
 * POST /api/v1/platform/trials/:trialId/suspend
 * Suspend a trial. Platform admin only.
 */
async function suspendTrial(req, res, trialId) {
  const { reason } = req.body || {};
  await req.context.repositories.trials.update(trialId, {
    suspendedAt: new Date().toISOString(),
    status: 'suspended',
    metadata: reason ? JSON.stringify({ suspendReason: reason }) : undefined
  });
  return sendJson(res, 200, { data: { suspended: true, trialId } });
}

/**
 * POST /api/v1/platform/trials/:trialId/convert
 * Convert a trial to paid. Platform admin only.
 */
async function convertTrial(req, res, trialId) {
  const { plan } = req.body || {};
  await req.context.repositories.trials.update(trialId, {
    convertedAt: new Date().toISOString(),
    status: 'converted',
    plan: plan || undefined
  });
  return sendJson(res, 200, { data: { converted: true, trialId } });
}

/**
 * GET /api/v1/platform/trials/funnel
 * Trial funnel analytics. Platform admin only.
 */
async function trialFunnel(req, res) {
  const allTrials = await req.context.repositories.trials.listAll({});
  const total = allTrials.length;
  const verified = allTrials.filter(t => t.email_verified_at || t.emailVerifiedAt).length;
  const provisioned = allTrials.filter(t => t.provisioned_at || t.provisionedAt).length;
  const active = allTrials.filter(t => trialService.trialStatus(t) === 'active').length;
  const converted = allTrials.filter(t => t.converted_at || t.convertedAt).length;
  const expired = allTrials.filter(t => trialService.trialStatus(t) === 'expired').length;
  const cancelled = allTrials.filter(t => t.cancelled_at || t.cancelledAt).length;

  // Industry breakdown
  const byIndustry = {};
  allTrials.forEach(t => {
    const ind = t.industry || 'unknown';
    byIndustry[ind] = (byIndustry[ind] || 0) + 1;
  });

  // Source breakdown
  const bySource = {};
  allTrials.forEach(t => {
    const src = t.source || 'direct';
    bySource[src] = (bySource[src] || 0) + 1;
  });

  return sendJson(res, 200, { data: {
    funnel: { registered: total, verified, provisioned, active, converted, expired, cancelled },
    conversionRate: total > 0 ? Math.round((converted / total) * 100) : 0,
    byIndustry,
    bySource
  }});
}

module.exports = { listTrials, getTrialDetail, extendTrial, cancelTrial, suspendTrial, convertTrial, trialFunnel };
