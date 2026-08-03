const crypto = require('crypto');
const { sendJson } = require('../utils/http');
const { issueAccessToken } = require('../services/tokenService');
const { permissionsForRoles } = require('../auth/permissions');
const trialService = require('../services/trialService');

/**
 * POST /api/v1/trial/register
 * Self-service trial registration. No auth required.
 * Rate limited: max 5 registrations per IP per hour.
 */
const registrationAttempts = new Map(); // IP -> { count, resetAt }
const REG_LIMIT = 5;
const REG_WINDOW_MS = 60 * 60 * 1000; // 1 hour

function checkRegistrationRateLimit(req) {
  const ip = req.socket?.remoteAddress || req.headers['x-forwarded-for'] || 'unknown';
  const now = Date.now();
  const entry = registrationAttempts.get(ip);
  if (!entry || now > entry.resetAt) {
    registrationAttempts.set(ip, { count: 1, resetAt: now + REG_WINDOW_MS });
    return true;
  }
  entry.count++;
  if (entry.count > REG_LIMIT) return false;
  return true;
}

async function register(req, res) {
  // Rate limit registration attempts
  if (!checkRegistrationRateLimit(req)) {
    return sendJson(res, 429, { error: { code: 'rate_limited', message: 'Too many registration attempts. Please try again later.' } });
  }

  const { email, name, password, companyName, phone, country, timezone, industry, teamSize, source, campaign, plan } = req.body || {};

  // Validate
  const normalizedEmail = trialService.normalizeEmail(email);
  const errors = trialService.validateRegistration({ email: normalizedEmail, name, password, companyName });
  if (errors.length) {
    return sendJson(res, 400, { error: { code: 'validation_failed', message: errors[0], details: errors } });
  }

  // Check duplicate
  const existing = await req.context.repositories.trials.findByEmail(normalizedEmail);
  if (existing && existing.status !== 'expired' && existing.status !== 'cancelled') {
    return sendJson(res, 409, { error: { code: 'account_exists', message: 'That email is already connected to an account. Sign in or reset your password.' } });
  }

  // Generate tenant ID and verification token
  const tenantId = trialService.generateTenantId(companyName);
  const verificationToken = trialService.generateVerificationToken();
  const verificationTokenHash = trialService.hashToken(verificationToken);
  const now = new Date().toISOString();

  // Create trial record
  const trial = await req.context.repositories.trials.create({
    id: crypto.randomUUID(),
    tenantId,
    email: normalizedEmail,
    name,
    companyName,
    phone: phone || '',
    country: country || '',
    timezone: timezone || '',
    industry: industry || '',
    teamSize: teamSize || '',
    plan: plan || trialService.TRIAL_PLAN,
    status: 'pending_verification',
    verificationTokenHash,
    startedAt: now,
    expiresAt: trialService.trialExpiresAt(now),
    source: source || '',
    campaign: campaign || '',
    metadata: {}
  });

  // Create the user account (hashed password)
  const user = await req.context.repositories.users.create({
    tenantId,
    email: normalizedEmail,
    name,
    password,
    roles: ['owner', 'admin']
  });

  if (!user) {
    return sendJson(res, 500, { error: { code: 'provisioning_failed', message: 'We could not create your trial. Your information was not lost. Try again.' } });
  }

  // In development, expose the verification token for testing
  const responseData = {
    trialId: trial.id,
    tenantId,
    status: 'pending_verification',
    message: 'Check your email to verify your account.',
    expiresAt: trial.expiresAt
  };

  if (process.env.NODE_ENV !== 'production' && process.env.EXPOSE_AUTH_TOKENS === 'true') {
    responseData.developmentVerificationToken = verificationToken;
  }

  // Auto-verify in development if email not configured
  if (process.env.NODE_ENV !== 'production' && process.env.AUTO_VERIFY_TRIAL === 'true') {
    await req.context.repositories.trials.update(trial.id, {
      emailVerifiedAt: now,
      status: 'active',
      provisionedAt: now
    });
    // Issue session immediately
    const accessToken = issueAccessToken({
      userId: user.id,
      tenantId,
      email: normalizedEmail,
      roles: ['owner', 'admin'],
      permissions: permissionsForRoles(['owner', 'admin'])
    });
    responseData.status = 'active';
    responseData.accessToken = accessToken;
    responseData.tokenType = 'Bearer';
    responseData.user = { id: user.id, tenantId, email: normalizedEmail, name, roles: ['owner', 'admin'] };
  }

  return sendJson(res, 201, { data: responseData });
}

/**
 * POST /api/v1/trial/verify-email
 * Verify email with token. No auth required.
 */
async function verifyEmail(req, res) {
  const { token } = req.body || {};
  if (!token) return sendJson(res, 400, { error: { code: 'validation_failed', message: 'Verification token is required' } });

  const hash = trialService.hashToken(token);
  const trial = await req.context.repositories.trials.findByVerificationHash(hash);
  if (!trial) return sendJson(res, 400, { error: { code: 'invalid_token', message: 'Verification link is invalid or expired.' } });

  const now = new Date().toISOString();
  await req.context.repositories.trials.update(trial.id, {
    emailVerifiedAt: now,
    status: 'active',
    provisionedAt: now
  });

  // Issue session
  const user = await req.context.repositories.users.findByEmail(trial.tenant_id || trial.tenantId, trial.email);
  if (!user) return sendJson(res, 500, { error: { code: 'provisioning_failed', message: 'Account not found. Please try registering again.' } });

  const accessToken = issueAccessToken({
    userId: user.id,
    tenantId: trial.tenant_id || trial.tenantId,
    email: trial.email,
    roles: user.roles || ['owner', 'admin'],
    permissions: permissionsForRoles(user.roles || ['owner', 'admin'])
  });

  return sendJson(res, 200, { data: {
    verified: true,
    accessToken,
    tokenType: 'Bearer',
    tenantId: trial.tenant_id || trial.tenantId,
    user: { id: user.id, email: user.email, name: user.name, roles: user.roles }
  }});
}

/**
 * POST /api/v1/trial/resend-verification
 * Resend verification email.
 */
async function resendVerification(req, res) {
  const { email } = req.body || {};
  if (!email) return sendJson(res, 400, { error: { code: 'validation_failed', message: 'email is required' } });

  const trial = await req.context.repositories.trials.findByEmail(trialService.normalizeEmail(email));
  if (!trial || trial.emailVerifiedAt || trial.email_verified_at) {
    // Don't reveal whether email exists
    return sendJson(res, 202, { data: { accepted: true, message: 'If that email has a pending verification, a new link has been sent.' } });
  }

  // Generate new token
  const newToken = trialService.generateVerificationToken();
  await req.context.repositories.trials.update(trial.id, {
    verificationTokenHash: trialService.hashToken(newToken)
  });

  const responseData = { accepted: true, message: 'Verification email resent.' };
  if (process.env.NODE_ENV !== 'production' && process.env.EXPOSE_AUTH_TOKENS === 'true') {
    responseData.developmentVerificationToken = newToken;
  }

  return sendJson(res, 202, { data: responseData });
}

/**
 * GET /api/v1/trial/status
 * Current trial status. Requires auth.
 */
async function status(req, res) {
  const tenantId = req.context.tenantId;
  const trial = await req.context.repositories.trials.findByTenantId(tenantId);

  if (!trial) {
    // Not a trial tenant — return active/paid status
    return sendJson(res, 200, { data: { isTrial: false, status: 'active', plan: 'paid' } });
  }

  const currentStatus = trialService.trialStatus(trial);
  const remaining = trialService.daysRemaining(trial.expires_at || trial.expiresAt);
  const entitlements = trialService.trialEntitlements();

  return sendJson(res, 200, { data: {
    isTrial: true,
    status: currentStatus,
    plan: trial.plan || entitlements.plan,
    startedAt: trial.started_at || trial.startedAt,
    expiresAt: trial.expires_at || trial.expiresAt,
    daysRemaining: remaining,
    industry: trial.industry || '',
    companyName: trial.company_name || trial.companyName,
    entitlements
  }});
}

/**
 * GET /api/v1/trial/usage
 * Current usage vs limits. Requires auth.
 */
async function usage(req, res) {
  const tenantId = req.context.tenantId;
  const entitlements = trialService.trialEntitlements();

  // Count resources (graceful — may not have these repos available)
  let customers = 0, jobs = 0, invoices = 0, users = 0;
  try {
    if (req.context.repositories.customers?.count) customers = await req.context.repositories.customers.count(tenantId);
    if (req.context.repositories.jobs?.count) jobs = await req.context.repositories.jobs.count(tenantId);
    if (req.context.repositories.invoices?.count) invoices = await req.context.repositories.invoices.count(tenantId);
    if (req.context.repositories.users?.countByTenant) users = await req.context.repositories.users.countByTenant(tenantId);
  } catch { /* graceful */ }

  return sendJson(res, 200, { data: {
    customers: { used: customers, limit: entitlements.maxCustomers },
    jobs: { used: jobs, limit: entitlements.maxJobs },
    invoices: { used: invoices, limit: entitlements.maxInvoices },
    users: { used: users, limit: entitlements.maxUsers }
  }});
}

/**
 * POST /api/v1/trial/select-industry
 * Set industry for onboarding. Requires auth.
 */
async function selectIndustry(req, res) {
  const { industry } = req.body || {};
  if (!industry) return sendJson(res, 400, { error: { code: 'validation_failed', message: 'industry is required' } });

  const tenantId = req.context.tenantId;
  const trial = await req.context.repositories.trials.findByTenantId(tenantId);
  if (trial) {
    await req.context.repositories.trials.update(trial.id, { industry });
  }

  // Update tenant settings with industry
  if (req.context.repositories.tenantSettings?.updateSettings) {
    await req.context.repositories.tenantSettings.updateSettings(tenantId, { industry });
  }

  // Auto-install matching industry pack if available
  let packInstalled = null;
  try {
    if (req.context.repositories.serviceMarketplace) {
      const catalog = await req.context.repositories.serviceMarketplace.listCatalog();
      const packCode = `pack-${industry.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
      const pack = catalog.find(item =>
        item.itemType === 'service_pack' &&
        (item.code === packCode || (item.industries || []).includes(industry.toLowerCase()))
      );
      if (pack) {
        const existing = await req.context.repositories.serviceMarketplace.listInstallations(tenantId);
        const alreadyInstalled = existing.find(i => i.itemId === pack.id);
        if (!alreadyInstalled) {
          await req.context.repositories.serviceMarketplace.install(tenantId, pack.id);
          packInstalled = { id: pack.id, name: pack.name, code: pack.code };
        } else {
          packInstalled = { id: pack.id, name: pack.name, code: pack.code, alreadyInstalled: true };
        }
      }
    }
  } catch { /* graceful — pack installation is optional */ }

  return sendJson(res, 200, { data: { industry, updated: true, packInstalled } });
}

/**
 * POST /api/v1/trial/sample-data
 * Provision sample data. Requires auth.
 */
async function installSampleData(req, res) {
  const tenantId = req.context.tenantId;
  const trial = await req.context.repositories.trials.findByTenantId(tenantId);
  const industry = trial?.industry || req.body?.industry || 'plumbing';

  const manifest = trialService.sampleDataManifest(industry);

  // Create sample customers
  const sampleCustomers = [
    { name: '[Sample] Johnson Family', email: 'sample.johnson@example.com', phone: '555-0101', address: '123 Oak Street' },
    { name: '[Sample] Garcia Residence', email: 'sample.garcia@example.com', phone: '555-0102', address: '456 Elm Avenue' },
    { name: '[Sample] Park Office Complex', email: 'sample.park@example.com', phone: '555-0103', address: '789 Commerce Blvd' },
    { name: '[Sample] Williams Apartment', email: 'sample.williams@example.com', phone: '555-0104', address: '321 River Road #4B' },
    { name: '[Sample] Chen Property Group', email: 'sample.chen@example.com', phone: '555-0105', address: '55 Industrial Park Drive' }
  ];

  let created = { customers: 0, jobs: 0 };
  try {
    if (req.context.repositories.customers?.create) {
      for (const c of sampleCustomers) {
        await req.context.repositories.customers.create({ ...c, tenantId, isSample: true });
        created.customers++;
      }
    }
  } catch { /* graceful */ }

  return sendJson(res, 201, { data: { installed: true, manifest, created } });
}

/**
 * DELETE /api/v1/trial/sample-data
 * Remove all sample data. Requires auth.
 */
async function removeSampleData(req, res) {
  const tenantId = req.context.tenantId;
  // Remove records tagged as sample
  let removed = { customers: 0 };
  try {
    if (req.context.repositories.customers?.removeSample) {
      removed.customers = await req.context.repositories.customers.removeSample(tenantId);
    }
  } catch { /* graceful */ }

  return sendJson(res, 200, { data: { removed: true, counts: removed } });
}

/**
 * GET /api/v1/trial/onboarding
 * Get onboarding checklist progress. Requires auth.
 */
async function getOnboarding(req, res) {
  const tenantId = req.context.tenantId;
  const steps = await req.context.repositories.trials.getOnboardingSteps(tenantId);

  const checklist = trialService.ONBOARDING_STEPS.map(step => {
    const record = steps.find(s => (s.step_key || s.stepKey) === step.key);
    return {
      key: step.key,
      label: step.label,
      sequence: step.sequence,
      status: record ? (record.status || 'pending') : 'pending',
      completedAt: record?.completed_at || record?.completedAt || null
    };
  });

  const completed = checklist.filter(s => s.status === 'completed').length;

  return sendJson(res, 200, { data: {
    steps: checklist,
    completed,
    total: checklist.length,
    allDone: completed === checklist.length
  }});
}

/**
 * PATCH /api/v1/trial/onboarding/:stepKey
 * Mark onboarding step as completed. Requires auth.
 */
async function completeOnboardingStep(req, res, stepKey) {
  const tenantId = req.context.tenantId;
  const userId = req.context.userId;

  const validStep = trialService.ONBOARDING_STEPS.find(s => s.key === stepKey);
  if (!validStep) return sendJson(res, 400, { error: { code: 'invalid_step', message: `Unknown onboarding step: ${stepKey}` } });

  const status = req.body?.status || 'completed';
  const record = await req.context.repositories.trials.upsertOnboardingStep(tenantId, userId, stepKey, status);

  return sendJson(res, 200, { data: { step: stepKey, status, completedAt: record?.completed_at || record?.completedAt } });
}

/**
 * POST /api/v1/trial/upgrade-request
 * Request upgrade or contact sales. Requires auth.
 */
async function upgradeRequest(req, res) {
  const tenantId = req.context.tenantId;
  const { plan, message } = req.body || {};

  const trial = await req.context.repositories.trials.findByTenantId(tenantId);

  // Record the upgrade intent
  const request = {
    tenantId,
    userId: req.context.userId,
    email: req.context.email,
    requestedPlan: plan || 'professional',
    message: message || '',
    trialId: trial?.id || null,
    requestedAt: new Date().toISOString()
  };

  // Store as audit event if available
  try {
    if (req.context.repositories.audit?.create) {
      await req.context.repositories.audit.create({
        tenantId,
        userId: req.context.userId,
        action: 'trial.upgrade_requested',
        metadata: request
      });
    }
  } catch { /* graceful */ }

  return sendJson(res, 200, { data: {
    accepted: true,
    message: 'Your upgrade request has been received. Our team will contact you within 1 business day.',
    request
  }});
}

/**
 * POST /api/v1/trial/convert
 * Convert trial to paid (admin action or payment confirmation). Requires auth.
 */
async function convert(req, res) {
  const tenantId = req.context.tenantId;
  const trial = await req.context.repositories.trials.findByTenantId(tenantId);
  if (!trial) return sendJson(res, 404, { error: { code: 'not_found', message: 'No trial found for this tenant' } });

  const now = new Date().toISOString();
  await req.context.repositories.trials.update(trial.id, {
    convertedAt: now,
    status: 'converted'
  });

  return sendJson(res, 200, { data: {
    converted: true,
    tenantId,
    convertedAt: now,
    message: 'Your trial has been converted to a paid subscription. All your data has been preserved.'
  }});
}

/**
 * GET /api/v1/trial/help
 * Trial-specific help content and tutorials. Requires auth.
 */
async function help(req, res) {
  const tutorials = [
    { id: 'quick-start', title: 'Five-minute quick start', description: 'Get ServicePro running in 5 minutes.', url: '/documentation#quick-start', duration: '5 min' },
    { id: 'first-customer', title: 'Create your first customer', description: 'Add a customer with contact details and service history.', url: '/customers', duration: '2 min', guided: true },
    { id: 'schedule-job', title: 'Schedule your first job', description: 'Create an appointment and assign a technician.', url: '/scheduling', duration: '3 min', guided: true },
    { id: 'dispatch', title: 'Dispatch a technician', description: 'Assign work and track status in real time.', url: '/dispatch', duration: '2 min', guided: true },
    { id: 'work-order', title: 'Complete a work order', description: 'Walk through the full job lifecycle.', url: '/jobs', duration: '5 min', guided: true },
    { id: 'invoice', title: 'Create and send an invoice', description: 'Generate an invoice and record payment.', url: '/invoices', duration: '3 min', guided: true },
    { id: 'portal', title: 'Preview the customer portal', description: 'See what your customers see.', url: '/portal', duration: '2 min' },
    { id: 'storefront', title: 'Build your storefront', description: 'Create a professional website for your business.', url: '/storefront-builder', duration: '10 min' },
    { id: 'team', title: 'Invite your team', description: 'Add technicians and office staff.', url: '/team', duration: '3 min' },
    { id: 'trial-info', title: 'Understand your trial', description: 'What\'s included, limits, and how to upgrade.', url: '/documentation#trial', duration: '3 min' },
    { id: 'upgrade', title: 'Upgrade your account', description: 'Choose a plan and continue with ServicePro.', url: '/settings/upgrade', duration: '2 min' }
  ];

  return sendJson(res, 200, { data: { tutorials, total: tutorials.length } });
}

module.exports = {
  register,
  verifyEmail,
  resendVerification,
  status,
  usage,
  selectIndustry,
  installSampleData,
  removeSampleData,
  getOnboarding,
  completeOnboardingStep,
  upgradeRequest,
  convert,
  help
};
