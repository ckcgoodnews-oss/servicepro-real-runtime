const http = require('http');
const { version } = require('../../../package.json');
const { router } = require('./router');
const { getBaseStore } = require('./repositories/repositoryFactory');

// Warm up the database pool at startup so the first real request is not
// delayed by connection establishment. No query is actually run here.
try { getBaseStore(); } catch (_) { /* non-fatal — will fail properly on first request */ }

const port = Number(process.env.PORT || 3000);

const server = http.createServer(async (req, res) => {
  try {
    await router(req, res);
  } catch (err) {
    console.error(err);
    res.writeHead(500, { 'content-type': 'application/json' });
    res.end(JSON.stringify({ error: { code: 'internal_error', message: 'Internal server error' } }));
  }
});

server.listen(port, () => {
  console.log(`ServicePro ${version} API running on http://localhost:${port}`);
});

module.exports = { server };
