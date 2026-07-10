const http = require('http');
const { router } = require('./router');
const { ensureStore } = require('./store/jsonStore');

ensureStore();

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
  console.log(`ServicePro Sprint 51 API running on http://localhost:${port}`);
});

module.exports = { server };
