const sensitiveKey = /authorization|cookie|password|passwd|secret|token|api[-_]?key|client[-_]?secret|database[-_]?url|connection[-_]?string/i;
const bearer = /\bBearer\s+[A-Za-z0-9._~+\/-]+=*/gi;
const jwt = /\beyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\b/g;

export function sanitizeForTelemetry(value: unknown, seen = new WeakSet<object>()): unknown {
  if (typeof value === 'string') return value.replace(bearer, '[REDACTED]').replace(jwt, '[REDACTED]');
  if (!value || typeof value !== 'object') return value;
  if (seen.has(value)) return '[CIRCULAR]';
  seen.add(value);
  if (Array.isArray(value)) return value.map(item => sanitizeForTelemetry(item, seen));
  return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, sensitiveKey.test(key) ? '[REDACTED]' : sanitizeForTelemetry(item, seen)]));
}

export const sentryPrivacyOptions = {
  sendDefaultPii: false,
  beforeSend: <T>(event: T): T => sanitizeForTelemetry(event) as T,
  beforeBreadcrumb: <T>(breadcrumb: T): T => sanitizeForTelemetry(breadcrumb) as T
};
