/**
 * Trial lifecycle notification service.
 * Generates in-app notifications at key trial lifecycle points.
 * Email delivery depends on external provider configuration.
 */

const { TRIAL_DURATION_DAYS, daysRemaining } = require('./trialService');

const NOTIFICATION_EVENTS = [
  { trigger: 'trial_started', daysFromStart: 0, subject: 'Welcome to ServicePro!', body: 'Your 14-day trial has started. Complete the setup checklist to get the most from your evaluation.' },
  { trigger: 'day_1_welcome', daysFromStart: 1, subject: 'Quick start: create your first customer', body: 'Add a customer, schedule a job, and see how ServicePro connects your workflow in minutes.' },
  { trigger: 'trial_halfway', daysFromStart: 7, subject: 'You\'re halfway through your trial', body: 'You have 7 days left. Need help exploring any features? Our team is here.' },
  { trigger: 'three_days_remaining', daysFromStart: 11, subject: '3 days left in your trial', body: 'Your trial ends soon. Ready to continue? View plans and upgrade to keep your data active.' },
  { trigger: 'one_day_remaining', daysFromStart: 13, subject: 'Last day of your trial', body: 'Your trial expires tomorrow. Upgrade now to avoid any interruption. Your data will be preserved either way.' },
  { trigger: 'trial_expired', daysFromStart: 14, subject: 'Your ServicePro trial has ended', body: 'Your trial has expired. Your data is safe — sign in anytime to upgrade and resume operations.' }
];

/**
 * Determine which notifications should fire for a trial at a given point in time.
 */
function pendingNotifications(trial, alreadySent = []) {
  if (!trial || !trial.startedAt) return [];
  const sentSet = new Set(alreadySent);
  const startDate = new Date(trial.startedAt || trial.started_at);
  const now = Date.now();
  const daysSinceStart = Math.floor((now - startDate.getTime()) / 86_400_000);

  return NOTIFICATION_EVENTS.filter(event => {
    if (sentSet.has(event.trigger)) return false;
    return daysSinceStart >= event.daysFromStart;
  });
}

/**
 * Get a single notification for display given trial status
 */
function currentTrialNotification(trial) {
  if (!trial) return null;
  const remaining = daysRemaining(trial.expiresAt || trial.expires_at);

  if (remaining <= 0) return { type: 'expired', subject: 'Your trial has ended', body: 'Upgrade to continue using ServicePro. Your data is preserved.', urgency: 'critical' };
  if (remaining <= 1) return { type: 'last_day', subject: 'Last day of your trial', body: 'Upgrade before tomorrow to avoid interruption.', urgency: 'urgent' };
  if (remaining <= 3) return { type: 'expiring', subject: `${remaining} days left in your trial`, body: 'Consider upgrading to keep full access to your workspace.', urgency: 'warning' };
  if (remaining <= 7) return { type: 'halfway', subject: `${remaining} days remaining`, body: 'Explore all features before your trial ends.', urgency: 'info' };
  return null;
}

/**
 * Format a trial notification for the notification queue
 */
function formatNotification(tenantId, userId, event) {
  return {
    tenantId,
    userId,
    channel: 'in_app',
    subject: event.subject,
    body: event.body,
    category: 'trial_lifecycle',
    metadata: { trigger: event.trigger },
    status: 'pending'
  };
}

module.exports = {
  NOTIFICATION_EVENTS,
  pendingNotifications,
  currentTrialNotification,
  formatNotification
};
