const http = require('http');
const { version } = require('../../../package.json');
const { router } = require('./router');
const { getBaseStore } = require('./repositories/repositoryFactory');
const { runtime: sentry } = require('./observability/sentry');

try {
  sentry.initialize();
} catch (error) {
  console.error(JSON.stringify({ level: 'error', event: 'sentry_initialization_failed', message: error.message }));
}

process.once('uncaughtException', async error => {
  sentry.captureException(error, { source: 'uncaughtException' });
  console.error(error);
  await sentry.flush();
  process.exit(1);
});

process.on('unhandledRejection', error => {
  sentry.captureException(error instanceof Error ? error : new Error(String(error)), { source: 'unhandledRejection' });
  console.error(error);
});

// Warm up the database pool at startup so the first real request is not
// delayed by connection establishment. No query is actually run here.
try { getBaseStore(); } catch (_) { /* non-fatal — will fail properly on first request */ }

const port = Number(process.env.PORT || 3000);

const server = http.createServer(async (req, res) => {
  try {
    await router(req, res);
  } catch (err) {
    sentry.captureException(err, {
      source: 'http_request',
      method: req.method,
      path: String(req.url || '').split('?')[0],
      requestId: req.context?.requestId || ''
    });
    console.error(err);
    res.writeHead(500, { 'content-type': 'application/json' });
    res.end(JSON.stringify({ error: { code: 'internal_error', message: 'Internal server error' } }));
  }
});

server.listen(port, () => {
  console.log(`ServicePro ${version} API running on http://localhost:${port}`);
});

module.exports = { server };
