const crypto = require('crypto');
const { validationError } = require('../errors/domainError');

const TRIAL_DURATION_DAYS = Number(process.env.TRIAL_DURATION_DAYS || 14);
const TRIAL_PLAN = process.env.TRIAL_PLAN || 'professional';
const TRIAL_MAX_USERS = Number(process.env.TRIAL_MAX_USERS || 3);
const TRIAL_MAX_TECHNICIANS = Number(process.env.TRIAL_MAX_TECHNICIANS || 3);
const TRIAL_MAX_CUSTOMERS = Number(process.env.TRIAL_MAX_CUSTOMERS || 50);
const TRIAL_MAX_JOBS = Number(process.env.TRIAL_MAX_JOBS || 25);
const TRIAL_MAX_INVOICES = Number(process.env.TRIAL_MAX_INVOICES || 20);

const TRIAL_STATUSES = ['pending_verification', 'provisioning', 'active', 'expiring', 'expired', 'converted', 'cancelled', 'suspended'];

const ONBOARDING_STEPS = [
  { key: 'company_info', label: 'Add company information', sequence: 1 },
  { key: 'business_hours', label: 'Configure business hours', sequence: 2 },
  { key: 'services', label: 'Select your services', sequence: 3 },
  { key: 'team', label: 'Add or invite team members', sequence: 4 },
  { key: 'first_customer', label: 'Add your first customer', sequence: 5 },
  { key: 'first_job', label: 'Create your first work order', sequence: 6 },
  { key: 'customer_portal', label: 'Preview your customer portal', sequence: 7 },
  { key: 'storefront', label: 'Publish or preview your storefront', sequence: 8 }
];

function generateTenantId(companyName) {
  const slug = String(companyName || 'trial')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '')
    .slice(0, 30);
  const suffix = crypto.randomBytes(4).toString('hex');
  return `trial_${slug}_${suffix}`;
}

function generateVerificationToken() {
  return crypto.randomBytes(32).toString('hex');
}

function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

function trialExpiresAt(startDate) {
  const d = new Date(startDate || Date.now());
  d.setUTCDate(d.getUTCDate() + TRIAL_DURATION_DAYS);
  return d.toISOString();
}

function daysRemaining(expiresAt) {
  if (!expiresAt) return 0;
  const ms = new Date(expiresAt).getTime() - Date.now();
  return Math.max(0, Math.ceil(ms / 86_400_000));
}

function trialStatus(trial) {
  if (!trial) return 'unknown';
  if (trial.convertedAt) return 'converted';
  if (trial.cancelledAt) return 'cancelled';
  if (trial.suspendedAt) return 'suspended';
  if (!trial.emailVerifiedAt) return 'pending_verification';
  if (!trial.provisionedAt) return 'provisioning';
  const remaining = daysRemaining(trial.expiresAt);
  if (remaining <= 0) return 'expired';
  if (remaining <= 3) return 'expiring';
  return 'active';
}

function validateRegistration(input) {
  const errors = [];
  if (!input.email) errors.push('email is required');
  if (!input.name) errors.push('name is required');
  if (!input.password) errors.push('password is required');
  if (!input.companyName) errors.push('companyName is required');

  if (input.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email)) {
    errors.push('Enter a valid work email address');
  }

  // Password policy
  const pw = String(input.password || '');
  const pwErrors = [];
  if (pw.length < 12) pwErrors.push('at least 12 characters');
  if (!/[A-Z]/.test(pw)) pwErrors.push('an uppercase letter');
  if (!/[a-z]/.test(pw)) pwErrors.push('a lowercase letter');
  if (!/[0-9]/.test(pw)) pwErrors.push('a number');
  if (!/[^A-Za-z0-9]/.test(pw)) pwErrors.push('a symbol');
  if (pwErrors.length) errors.push(`Password must include ${pwErrors.join(', ')}`);

  return errors;
}

function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}

function trialEntitlements() {
  return {
    plan: TRIAL_PLAN,
    durationDays: TRIAL_DURATION_DAYS,
    maxUsers: TRIAL_MAX_USERS,
    maxTechnicians: TRIAL_MAX_TECHNICIANS,
    maxCustomers: TRIAL_MAX_CUSTOMERS,
    maxJobs: TRIAL_MAX_JOBS,
    maxInvoices: TRIAL_MAX_INVOICES,
    features: [
      'dashboard', 'customers', 'crm', 'scheduling', 'dispatch',
      'work_orders', 'estimates', 'invoices', 'inventory',
      'customer_portal', 'reporting', 'storefront_builder',
      'knowledge_base', 'ai_assistant', 'marketplace',
      'notifications', 'documents', 'team', 'settings'
    ]
  };
}

function sampleDataManifest(industry) {
  return {
    customers: 5,
    technicians: 2,
    jobs: 4,
    estimates: 2,
    invoices: 3,
    services: 6,
    appointments: 3,
    industry: industry || 'general'
  };
}

module.exports = {
  TRIAL_DURATION_DAYS,
  TRIAL_PLAN,
  TRIAL_STATUSES,
  ONBOARDING_STEPS,
  generateTenantId,
  generateVerificationToken,
  hashToken,
  trialExpiresAt,
  daysRemaining,
  trialStatus,
  validateRegistration,
  normalizeEmail,
  trialEntitlements,
  sampleDataManifest
};
