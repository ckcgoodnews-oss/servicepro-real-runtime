/**
 * Trial Access Guard Middleware
 *
 * Enforces restricted access for trial users. Blocks prohibited routes
 * at the middleware layer (not just hidden navigation).
 *
 * Enforcement layers:
 * 1. Route-level: this middleware blocks denied URL patterns
 * 2. Service-level: trialMarketplaceService.ALLOWED_EDIT_FIELDS
 * 3. Repository-level: tenant_id scoping on all queries
 * 4. UI-level: frontend hides navigation (defense in depth, not authorization)
 */

const { sendJson } = require('../utils/http');
const { isRouteBlockedForTrial, trialStatusFromRecord } = require('../services/trialMarketplaceService');

// Routes allowed even when trial is expired (read-only + upgrade path)
const EXPIRED_ALLOWED_PATTERNS = [
  '/api/v1/trial/',
  '/api/v1/me',
  '/api/v1/storefront/themes',
  '/api/v1/storefront/starter-services'
];

function isAllowedWhenExpired(url) {
  return EXPIRED_ALLOWED_PATTERNS.some(pattern => url.startsWith(pattern));
}

/**
 * Check if the current request is from a trial user and enforce restrictions.
 * Returns true if the request was blocked (response already sent).
 * Returns false if the request should continue.
 */
async function trialAccessGuard(req, res) {
  // Only applies to authenticated API requests
  if (!req.context?.tenantId || !req.context?.repositories?.trials) {
    return false;
  }

  // Check if this tenant has a trial
  let trial;
  try {
    trial = await req.context.repositories.trials.findByTenantId(req.context.tenantId);
  } catch {
    return false; // Graceful — don't block if trial lookup fails
  }

  // No trial record = paid user, no restrictions
  if (!trial) return false;

  const status = trialStatusFromRecord(trial);

  // Converted trials have no restrictions
  if (status === 'converted') return false;

  // Expired trial: block all mutations except upgrade/trial endpoints
  if (status === 'expired') {
    if (isAllowedWhenExpired(req.url)) return false;
    if (req.method === 'GET') return false; // Allow reads for data export
    sendJson(res, 403, {
      error: {
        code: 'trial_expired',
        message: 'Your trial has ended. Upgrade to continue using ServicePro.',
        upgradeUrl: '/settings/upgrade'
      }
    });
    return true;
  }

  // Active/expiring trial: block prohibited routes
  if (status === 'active' || status === 'expiring') {
    if (isRouteBlockedForTrial(req.url)) {
      sendJson(res, 403, {
        error: {
          code: 'trial_restricted',
          message: 'This feature is not available during your trial. Upgrade for full access.',
          upgradeUrl: '/settings/upgrade'
        }
      });
      return true;
    }
  }

  return false;
}

module.exports = { trialAccessGuard };
