const assert = require('assert');
const fs = require('fs');
const { sanitize, createSentryRuntime } = require('../apps/api/src/observability/sentry');

const clean = sanitize({
  request: { headers: { authorization: 'Bearer abc.def.ghi', cookie: 'session=secret' }, data: { password: 'secret', safe: 'ok' } },
  extra: { resetToken: 'reset-secret', databaseUrl: 'postgresql://user:pass@example/db' }
});
assert.strictEqual(clean.request.headers.authorization, '[REDACTED]');
assert.strictEqual(clean.request.headers.cookie, '[REDACTED]');
assert.strictEqual(clean.request.data.password, '[REDACTED]');
assert.strictEqual(clean.request.data.safe, 'ok');
assert.strictEqual(clean.extra.resetToken, '[REDACTED]');
assert.strictEqual(clean.extra.databaseUrl, '[REDACTED]');

let initialized;
let captured;
let extras = {};
const sdk = {
  init(options) { initialized = options; },
  withScope(callback) { return callback({ setExtra(key, value) { extras[key] = value; } }); },
  captureException(error) { captured = error; return 'event-id'; },
  flush: async () => true
};
const disabled = createSentryRuntime({ sdk, env: {} });
assert.strictEqual(disabled.initialize(), false);
assert.strictEqual(disabled.captureException(new Error('disabled')), undefined);

const enabled = createSentryRuntime({ sdk, env: { SENTRY_DSN: 'https://public@example.ingest.sentry.io/1', NODE_ENV: 'test' } });
assert.strictEqual(enabled.initialize(), true);
assert.strictEqual(initialized.sendDefaultPii, false);
assert.strictEqual(initialized.tracesSampleRate, 0);
const error = new Error('controlled');
assert.strictEqual(enabled.captureException(error, { authorization: 'Bearer secret', path: '/safe' }), 'event-id');
assert.strictEqual(captured, error);
assert.strictEqual(extras.authorization, '[REDACTED]');
assert.strictEqual(extras.path, '/safe');

const server = fs.readFileSync('apps/api/src/server.js', 'utf8');
assert.match(server, /sentry\.captureException\(err/);
const client = fs.readFileSync('apps/web/instrumentation-client.ts', 'utf8');
assert.match(client, /NEXT_PUBLIC_SENTRY_DSN/);
assert.doesNotMatch(client, /SENTRY_AUTH_TOKEN/);
const nextConfig = fs.readFileSync('apps/web/next.config.mjs', 'utf8');
assert.match(nextConfig, /SENTRY_AUTH_TOKEN/);
assert.match(nextConfig, /deleteSourcemapsAfterUpload: true/);

console.log('Production Sentry observability test passed.');
