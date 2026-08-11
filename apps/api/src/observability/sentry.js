const SENSITIVE_KEY = /authorization|cookie|password|passwd|secret|token|api[-_]?key|client[-_]?secret|dsn|database[-_]?url|connection[-_]?string/i;
const BEARER = /\bBearer\s+[A-Za-z0-9._~+\/-]+=*/gi;
const JWT = /\beyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\b/g;
const DATABASE_URL = /\b(?:postgres(?:ql)?|mysql|mongodb(?:\+srv)?):\/\/[^\s]+/gi;

function sanitize(value, seen = new WeakSet()) {
  if (typeof value === 'string') return value.replace(BEARER, '[REDACTED]').replace(JWT, '[REDACTED]').replace(DATABASE_URL, '[REDACTED]');
  if (!value || typeof value !== 'object') return value;
  if (seen.has(value)) return '[CIRCULAR]';
  seen.add(value);
  if (Array.isArray(value)) return value.map(item => sanitize(item, seen));
  const clean = {};
  for (const [key, item] of Object.entries(value)) clean[key] = SENSITIVE_KEY.test(key) ? '[REDACTED]' : sanitize(item, seen);
  return clean;
}

function beforeSend(event) { return sanitize(event); }
function beforeBreadcrumb(breadcrumb) { return sanitize(breadcrumb); }

function createSentryRuntime({ sdk, env = process.env } = {}) {
  const dsn = env.SENTRY_DSN || '';
  let client = sdk;
  let enabled = false;

  function initialize() {
    if (!dsn) return false;
    client = client || require('@sentry/node');
    client.init({
      dsn,
      environment: env.SENTRY_ENVIRONMENT || env.NODE_ENV || 'development',
      release: env.SENTRY_RELEASE || env.RENDER_GIT_COMMIT || undefined,
      sendDefaultPii: false,
      tracesSampleRate: Number(env.SENTRY_TRACES_SAMPLE_RATE || 0),
      beforeSend,
      beforeBreadcrumb
    });
    enabled = true;
    return true;
  }

  function captureException(error, context = {}) {
    if (!enabled || !client) return undefined;
    return client.withScope(scope => {
      const safeContext = sanitize(context);
      for (const [key, value] of Object.entries(safeContext)) scope.setExtra(key, value);
      return client.captureException(error);
    });
  }

  async function flush(timeoutMs = 2000) {
    if (!enabled || !client?.flush) return true;
    return client.flush(timeoutMs);
  }

  return { initialize, captureException, flush, isEnabled: () => enabled };
}

const runtime = createSentryRuntime();

module.exports = { sanitize, beforeSend, beforeBreadcrumb, createSentryRuntime, runtime };
