const http = require('http');
const { version } = require('../../../package.json');
const { router } = require('./router');
const { getRepositories } = require('./repositories/repositoryFactory');

// Initialize the configured store before accepting traffic. The repository store is
// the authoritative runtime datastore and owns the complete demo seed used by the
// online alpha. Do not initialize the legacy customer/job-only JSON store here.
getRepositories();

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
